import { defineStore } from 'pinia'
import { FEE_RATE, PAIRS, round, availableCash, availableQuantity, validateTrade, settleTrade } from '../domain/broker.js'
const STORAGE_KEY = 'crypto-eye-paper-account-v1'
const freshState = () => ({
  assetPair: 'BTC/USDT', assetTag: 'Spot demo', timeframe: 'M1', balance: 10000,
  tradeAmount: 100, activeTab: 'operations', operations: [], pendingOrders: [], history: [],
  notifications: [], profile: { name: 'Visitante', currency: 'USDT' }, holdings: {}, quotes: {},
  realizedPnl: 0, totalFees: 0, deposits: 10000, error: '', persistenceError: '', hydrated: false,
  footerStats: { buyTotal: 0, sellTotal: 0 },
})
export const useTradingUiStore = defineStore('tradingUi', {
  state: freshState,
  getters: {
    availableBalance: state => availableCash(state),
    reservedBalance: state => round(state.balance - availableCash(state)),
    currentQuote: state => state.quotes[state.assetPair]?.price || 0,
    currentQuantity: state => availableQuantity(state, state.assetPair),
    portfolioValue: state => Object.entries(state.holdings).some(([pair,h]) => h.quantity > 0 && !state.quotes[pair]) ? null : round(state.balance + Object.entries(state.holdings).reduce((sum, [pair, holding]) => sum + holding.quantity * (state.quotes[pair]?.price || 0), 0)),
    unrealizedPnl: state => round(Object.entries(state.holdings).reduce((sum, [pair, holding]) => sum + (state.quotes[pair] ? holding.quantity * state.quotes[pair].price - holding.cost : 0), 0)),
    estimatedQuantity: state => {
      const price = state.quotes[state.assetPair]?.price
      return price ? Math.floor(state.tradeAmount / (1 + FEE_RATE) / price * 1e8) / 1e8 : 0
    },
  },
  actions: {
    freeQuantity(pair) { return availableQuantity(this, pair) },
    withdrawDemoFunds(value) {
      const amount = Number(value)
      if (!Number.isFinite(amount) || amount < 1 || amount > this.availableBalance) return false
      this.balance = round(this.balance - amount)
      this.deposits = round(this.deposits - amount)
      this.notify(`Saque fictício de ${amount.toFixed(2)} USDT concluído.`)
      this.persist()
      return true
    },
    hydrate() {
      if (this.hydrated) return
      this.hydrated = true
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return
        const saved = JSON.parse(raw)
        const validMoney = value => Number.isFinite(value) && value >= 0
        if (saved.version !== 1 || !validMoney(saved.balance) || !validMoney(saved.totalFees) || !Number.isFinite(saved.realizedPnl) || !Number.isFinite(saved.deposits)) throw new Error('invalid account')
        if (!saved.holdings || typeof saved.holdings !== 'object' || Array.isArray(saved.holdings)) throw new Error('invalid holdings')
        for (const [pair, holding] of Object.entries(saved.holdings)) if (!PAIRS.includes(pair) || !validMoney(holding.quantity) || !validMoney(holding.cost)) throw new Error('invalid holding')
        for (const key of ['pendingOrders', 'history', 'operations', 'notifications']) if (!Array.isArray(saved[key])) throw new Error('invalid records')
        for (const order of saved.pendingOrders) {
          if (!PAIRS.includes(order.pair) || !['buy','sell'].includes(order.type) || !Number.isFinite(order.limitPrice) || order.limitPrice <= 0 || !validMoney(order.value) || order.value < 1 || order.value > 9999 || !Number.isFinite(order.quantity) || order.quantity <= 0 || typeof order.id !== 'string') throw new Error('invalid order')
        }
        if (new Set(saved.pendingOrders.map(o => o.id)).size !== saved.pendingOrders.length || availableCash(saved) < -1e-8 || PAIRS.some(pair => availableQuantity(saved, pair) < -1e-8)) throw new Error('invalid reserves')
        for (const key of ['balance', 'holdings', 'pendingOrders', 'history', 'operations', 'notifications', 'realizedPnl', 'totalFees', 'deposits']) this[key] = saved[key]
        this.profile.name = String(saved.profile?.name || 'Visitante').slice(0,60)
        for (const trade of this.history.filter(item => item.status === 'Executada')) this.footerStats[trade.type === 'buy' ? 'buyTotal' : 'sellTotal'] += Number(trade.notional) || 0
      } catch { this.persistenceError = 'Não foi possível restaurar a conta salva. O saldo inicial está sendo exibido; o arquivo anterior não será sobrescrito nesta sessão.' }
    },
    persist() {
      if (this.persistenceError) return
      try {
        const data = { version: 1 }
        for (const key of ['balance','holdings','pendingOrders','history','operations','notifications','realizedPnl','totalFees','deposits','profile']) data[key] = this[key]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      } catch { this.persistenceError = 'O navegador não permitiu salvar a conta. Mantenha esta página aberta para preservar os dados desta sessão.' }
    },
    notify(message) {
      this.notifications.unshift({ id: crypto.randomUUID(), message, time: new Date().toLocaleString('pt-BR'), read: false })
      this.notifications = this.notifications.slice(0,100)
    },
    markNotificationsRead() { this.notifications.forEach(item => { item.read = true }); this.persist() },
    saveProfile(name) { this.profile.name = String(name).trim().slice(0,60) || 'Visitante'; this.notify('Perfil atualizado.'); this.persist() },
    addDemoFunds(value) {
      const amount = Number(value)
      if (!Number.isFinite(amount) || amount < 1 || amount > 10000) return false
      this.balance = round(this.balance + amount)
      this.deposits = round(this.deposits + amount)
      this.notify(`Depósito fictício de ${amount.toFixed(2)} USDT.`)
      this.persist()
      return true
    },
    updateQuote(pair, price, timestamp = Date.now()) {
      if (!PAIRS.includes(pair) || !Number.isFinite(price) || price <= 0 || !Number.isFinite(timestamp) || Date.now() - timestamp > 30000 || timestamp > Date.now() + 5000) return
      this.quotes[pair] = { price, timestamp }
      for (const order of [...this.pendingOrders]) {
        if (order.pair === pair && (order.type === 'buy' ? price <= order.limitPrice : price >= order.limitPrice)) this.executeOrder(order.id)
      }
    },
    quoteFor(pair) {
      const quote = this.quotes[pair]
      if (!quote || Date.now() - quote.timestamp > 30000) throw new Error('Cotação desatualizada. Atualize antes de enviar a ordem.')
      return quote.price
    },
    queueOrder(type, limitPrice) {
      this.error = ''
      try {
        const price = Number(limitPrice)
        validateTrade(this, type, this.tradeAmount, this.assetPair, price)
        const quantity = Math.floor(this.tradeAmount / (type === 'buy' ? 1 + FEE_RATE : 1) / price * 1e8) / 1e8
        if (quantity <= 0) throw new Error('Quantidade abaixo da precisão disponível.')
        const order = { id: crypto.randomUUID(), type, pair: this.assetPair, value: this.tradeAmount, limitPrice: price, quantity, time: new Date().toLocaleString('pt-BR'), status: 'Pendente' }
        this.pendingOrders.unshift(order)
        this.notify(`Ordem limitada de ${order.pair} criada. Saldo reservado.`)
        this.activeTab = 'orders'
        const quote = this.quotes[order.pair]
        if (quote && Date.now() - quote.timestamp <= 30000) this.updateQuote(order.pair, quote.price, quote.timestamp)
        this.persist()
        return true
      } catch (error) { this.error = error.message; return false }
    },
    cancelOrder(id) {
      const order = this.pendingOrders.find(item => item.id === id)
      if (!order) return false
      this.pendingOrders = this.pendingOrders.filter(item => item.id !== id)
      this.history.unshift({ ...order, status: 'Cancelada' })
      this.notify(`Ordem de ${order.pair} cancelada; reserva liberada.`)
      this.persist()
      return true
    },
    executeOrder(id) {
      const order = this.pendingOrders.find(item => item.id === id)
      if (!order) return false
      try {
        const price = this.quoteFor(order.pair)
        if (order.type === 'buy' ? price > order.limitPrice : price < order.limitPrice) return false
        return this.recordOperation(order.type, order.value, order.pair, order)
      } catch (error) { this.error = error.message; return false }
    },
    closeOperation(id) {
      const operation = this.operations.find(item => item.id === id)
      if (!operation) return
      this.operations = this.operations.filter(item => item.id !== id)
      // Archiving changes only the activity view. Selling is a separate trade.
      const entry = this.history.find(item => item.id === id)
      if (entry) entry.archived = true
      this.persist()
    },
    setActiveTab(tab) { if (['operations','orders','history'].includes(tab)) this.activeTab = tab },
    incrementAmount() { this.setTradeAmount(this.tradeAmount + 1) },
    decrementAmount() { this.setTradeAmount(Math.max(1,this.tradeAmount - 1)) },
    setTradeAmount(value) { const n = Number(value); if (Number.isFinite(n) && n >= 1) this.tradeAmount = Math.min(9999,Math.round(n * 100) / 100) },
    placeOrder(type) { return this.recordOperation(type, this.tradeAmount, this.assetPair) },
    recordOperation(type, value, pair, order) {
      this.error = ''
      try {
        const price = this.quoteFor(pair)
        const settled = settleTrade(this, type, value, pair, price, order?.id, order?.quantity)
        this.balance = settled.balance
        this.holdings[pair] = settled.holding
        this.realizedPnl = round(this.realizedPnl + settled.realizedPnl)
        this.totalFees = round(this.totalFees + settled.fee)
        if (order) this.pendingOrders = this.pendingOrders.filter(item => item.id !== order.id)
        const trade = { id: crypto.randomUUID(), orderId: order?.id, type, pair, ...settled, time: new Date().toLocaleString('pt-BR'), status: 'Executada' }
        delete trade.balance
        delete trade.holding
        this.history.unshift(trade)
        this.operations.unshift(trade)
        this.operations = this.operations.slice(0,100)
        this.footerStats[type === 'buy' ? 'buyTotal' : 'sellTotal'] += settled.notional
        this.notify(`${type === 'buy' ? 'Compra' : 'Venda'} de ${settled.quantity} ${pair.split('/')[0]} executada na simulação.`)
        this.persist()
        return true
      } catch (error) { this.error = error.message; return false }
    },
  },
})
