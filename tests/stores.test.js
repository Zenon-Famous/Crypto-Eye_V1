import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import test from 'node:test'

// Exercise store actions without a browser or Pinia's Vue integration.
function loadStore(path, dependencies = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import .*$/gm, '')
    .replace(/export const \w+ = defineStore/, 'globalThis.definition = defineStore')
  const context = vm.createContext({
    defineStore: (_id, options) => options, console, crypto, ...dependencies,
  })
  vm.runInContext(source, context)
  const store = context.definition.state()
  for (const [name, action] of Object.entries(context.definition.actions)) store[name] = action.bind(store)
  return store
}

test('trade amounts reject nonfinite values and respect limits', () => {
  const store = loadStore('../src/stores/tradingUi.store.js')
  for (const value of [Infinity, NaN, -2, 0, 'invalid']) store.setTradeAmount(value)
  assert.equal(store.tradeAmount, 1)
  store.setTradeAmount(100000)
  assert.equal(store.tradeAmount, 9999)
  store.setTradeAmount('12.345')
  assert.equal(store.tradeAmount, 12.35)
  store.setTradeAmount(1)
  store.decrementAmount()
  assert.equal(store.tradeAmount, 1)
})

test('simulations track side, pair and unique ids without accepting invalid sides', () => {
  const store = loadStore('../src/stores/tradingUi.store.js')
  store.placeOrder('invalid')
  assert.equal(store.operations.length, 0)
  store.placeOrder('buy')
  store.assetPair = 'ETH/USDT'
  store.placeOrder('sell')
  assert.equal(store.operations[0].pair, 'ETH/USDT')
  assert.equal(store.operations[1].pair, 'BTC/USDT')
  assert.notEqual(store.operations[0].id, store.operations[1].id)
  assert.equal(store.operations[0].active, true)
  assert.equal(store.operations[1].active, false)
  assert.equal(store.footerStats.buyTotal, 1)
  assert.equal(store.footerStats.sellTotal, 1)
})

test('switching markets closes connecting sockets and ignores stale messages', () => {
  const sockets = []
  const store = loadStore('../src/stores/binanceWebSocket.store.js', {
    createWebSocket: (_pair, _frame, onMessage) => {
      const socket = { onMessage, closed: false, close() { this.closed = true } }
      sockets.push(socket)
      return socket
    },
  })
  const candle = { s: 'BTCUSDT', t: 1000, o: '1', h: '2', l: '1', c: '2', v: '3' }
  store.connect('BTCUSDT', '1m')
  sockets[0].onMessage(candle)
  store.connect('BTCUSDT', '1m')
  assert.equal(sockets[0].closed, true)
  assert.equal(store.cryptosRealtime.length, 0)
  sockets[0].onMessage(candle)
  assert.equal(store.cryptosRealtime.length, 0)
  sockets[1].onMessage(candle)
  sockets[1].onMessage({ ...candle, c: '1.5' })
  assert.equal(store.cryptosRealtime.length, 1)
  assert.equal(store.cryptosRealtime[0].y[3], 1.5)
  store.disconnect()
  sockets[1].onMessage({ ...candle, t: 2000 })
  assert.equal(store.cryptosRealtime.length, 1)
})
