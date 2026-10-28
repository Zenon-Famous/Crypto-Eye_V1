import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import test, { beforeEach } from 'node:test'
import { createPinia, setActivePinia } from 'pinia'
import { useTradingUiStore } from '../src/stores/tradingUi.store.js'
const storage = new Map()
globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key,value) => storage.set(key,value) }
beforeEach(() => { setActivePinia(createPinia()); storage.clear() })
function account() { const store = useTradingUiStore(); store.updateQuote('BTC/USDT',100); return store }

test('buy debits budget including fee; sale credits proceeds and realizes profit', () => {
  const store = account()
  assert.equal(store.recordOperation('buy',1000,'BTC/USDT'), true)
  assert.ok(Math.abs(store.balance - 9000) < 0.00001)
  assert.ok(store.holdings['BTC/USDT'].quantity > 9.99)
  assert.ok(store.totalFees > 0.99)
  store.updateQuote('BTC/USDT',120)
  assert.equal(store.recordOperation('sell',600,'BTC/USDT'), true)
  assert.ok(store.balance > 9599)
  assert.ok(Math.abs(store.realizedPnl - 98.9) < 0.000001)
  assert.equal(store.history.length,2)
  assert.equal(store.history[0].status,'Executada')
})
test('insufficient cash, short sales, invalid inputs and stale quotes cannot mutate balances', () => {
  const store = account()
  assert.equal(store.recordOperation('sell',100,'BTC/USDT'), false)
  for (const n of [Infinity, NaN, -1, 10000]) assert.equal(store.recordOperation('buy',n,'BTC/USDT'),false)
  store.balance = 10
  assert.equal(store.recordOperation('buy',100,'BTC/USDT'),false)
  store.quotes['BTC/USDT'].timestamp = Date.now() - 31000
  assert.equal(store.recordOperation('buy',5,'BTC/USDT'),false)
  assert.equal(store.balance,10)
  assert.equal(store.history.length,0)
})
test('limit buys reserve funds and fill exactly once at the limit or better', () => {
  const store = account()
  store.setTradeAmount(9999)
  assert.equal(store.queueOrder('buy',90),true)
  assert.equal(store.availableBalance,1)
  assert.equal(store.recordOperation('buy',10,'BTC/USDT'),false)
  const id = store.pendingOrders[0].id
  assert.equal(store.executeOrder(id),false)
  store.updateQuote('BTC/USDT',85)
  assert.equal(store.pendingOrders.length,0)
  assert.equal(store.history.length,1)
  assert.ok(store.balance > 500)
  store.updateQuote('BTC/USDT',84)
  assert.equal(store.history.length,1)
})
test('sell limits reserve assets; cancelling releases the reservation', () => {
  const store = account()
  store.recordOperation('buy',1000,'BTC/USDT')
  store.setTradeAmount(1000)
  assert.equal(store.queueOrder('sell',120),true)
  assert.ok(store.currentQuantity < 2)
  assert.equal(store.recordOperation('sell',500,'BTC/USDT'),false)
  const order = store.pendingOrders[0]
  assert.equal(store.cancelOrder(order.id),true)
  assert.ok(store.currentQuantity > 9)
  assert.equal(store.executeOrder(order.id),false)
  assert.equal(store.history[0].status,'Cancelada')
})
test('saved account restores balances, holdings and reservations without trusting stale prices', () => {
  const store = account()
  store.recordOperation('buy',1000,'BTC/USDT')
  store.setTradeAmount(100)
  store.queueOrder('buy',80)
  store.saveProfile('Davi')
  setActivePinia(createPinia())
  const restored = useTradingUiStore()
  restored.hydrate()
  assert.equal(restored.balance,store.balance)
  assert.equal(restored.availableBalance,store.availableBalance)
  assert.equal(restored.holdings['BTC/USDT'].quantity,store.holdings['BTC/USDT'].quantity)
  assert.equal(restored.profile.name,'Davi')
  assert.equal(restored.currentQuote,0)
  assert.equal(restored.recordOperation('buy',10,'BTC/USDT'),false)
})
test('corrupt saved data stays intact and invalid deposits are rejected', () => {
  storage.set('crypto-eye-paper-account-v1','{invalid')
  const store = account()
  store.hydrate()
  assert.ok(store.persistenceError)
  store.persist()
  assert.equal(storage.get('crypto-eye-paper-account-v1'),'{invalid')
  for (const n of [Infinity,-1,10001]) assert.equal(store.addDemoFunds(n),false)
})
test('archiving a trade never sells holdings or changes cash', () => {
  const store = account()
  store.recordOperation('buy',100,'BTC/USDT')
  const cash = store.balance, quantity = store.currentQuantity
  store.closeOperation(store.operations[0].id)
  assert.equal(store.balance,cash)
  assert.equal(store.currentQuantity,quantity)
  assert.equal(store.history.length,1)
})
test('switching markets closes connecting sockets and rejects stale events', () => {
  const source = readFileSync(new URL('../src/stores/binanceWebSocket.store.js',import.meta.url),'utf8').replace(/^import .*$/gm,'').replace(/export const \w+ = defineStore/,'globalThis.definition = defineStore')
  const sockets=[]
  const context=vm.createContext({ defineStore: (_id,options) => options, console, createWebSocket: (_pair,_frame,onMessage) => { const socket={onMessage,closed:false,close(){this.closed=true}}; sockets.push(socket);return socket } })
  vm.runInContext(source,context)
  const store=context.definition.state()
  for(const [name,fn] of Object.entries(context.definition.actions)) store[name]=fn.bind(store)
  store.connect('BTCUSDT','1m');store.connect('BTCUSDT','1m')
  assert.equal(sockets[0].closed,true)
  sockets[0].onMessage({s:'BTCUSDT',t:1000,o:'1',h:'2',l:'1',c:'2',v:'3'})
  assert.equal(store.cryptosRealtime.length,0)
})

test('withdrawals never spend money reserved by pending orders', () => {
  const store = account()
  store.setTradeAmount(9999)
  store.queueOrder('buy',90)
  assert.equal(store.withdrawDemoFunds(2),false)
  assert.equal(store.withdrawDemoFunds(1),true)
  assert.equal(store.availableBalance,0)
  store.cancelOrder(store.pendingOrders[0].id)
  assert.equal(store.availableBalance,9999)
})
test('sell limits execute when price crosses and charge exactly one fee', () => {
  const store = account()
  store.recordOperation('buy',1000,'BTC/USDT')
  store.setTradeAmount(600)
  store.queueOrder('sell',120)
  store.updateQuote('BTC/USDT',121)
  assert.equal(store.pendingOrders.length,0)
  assert.equal(store.history[0].type,'sell')
  assert.equal(store.history[0].quantity,5)
  assert.equal(store.history[0].fee,0.605)
  const fees = store.totalFees
  store.updateQuote('BTC/USDT',122)
  assert.equal(store.totalFees,fees)
})
