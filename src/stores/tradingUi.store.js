import { defineStore } from 'pinia'

export const useTradingUiStore = defineStore('tradingUi', {
  state: () => ({
    assetPair: 'BTC/USDT',
    assetTag: 'Crypto',
    timeframe: 'M1',
    balance: 0.85,
    tradeAmount: 1,
    profitPercent: 92,
    volume24h: 847002,
    activeTab: 'operations',
    operations: [],
    pendingOrders: [],
    history: [],
    notifications: [],
    profile: { name: 'Visitante', currency: 'USD' },
    footerStats: { buyTotal: 0, sellTotal: 0 },
  }),

  getters: {
    potentialReturn(state) {
      return ((state.tradeAmount * state.profitPercent) / 100).toFixed(2)
    },
    formattedVolume(state) {
      return state.volume24h.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      })
    },
  },

  actions: {
    notify(message) {
      this.notifications.unshift({ id: crypto.randomUUID(), message, time: new Date().toLocaleString('pt-BR'), read: false })
      this.notifications = this.notifications.slice(0, 100)
    },
    markNotificationsRead() {
      this.notifications.forEach(item => { item.read = true })
    },
    saveProfile(name) {
      this.profile.name = String(name).trim().slice(0, 60) || 'Visitante'
      this.notify('Perfil demonstrativo atualizado.')
    },
    addDemoFunds(value) {
      const amount = Number(value)
      if (!Number.isFinite(amount) || amount < 1 || amount > 10000) return false
      this.balance = Math.round((this.balance + amount) * 100) / 100
      this.notify(`Crédito demonstrativo de US$ ${amount.toFixed(2)} adicionado.`)
      return true
    },
    queueOrder(type) {
      if (!['buy', 'sell'].includes(type)) return
      this.pendingOrders.unshift({ id: crypto.randomUUID(), type, pair: this.assetPair, value: this.tradeAmount, time: new Date().toLocaleTimeString('pt-BR'), active: false })
      this.notify(`Ordem simulada de ${type === 'buy' ? 'compra' : 'venda'} criada para ${this.assetPair}.`)
      this.activeTab = 'orders'
    },
    cancelOrder(id) {
      const order = this.pendingOrders.find(item => item.id === id)
      if (!order) return
      this.pendingOrders = this.pendingOrders.filter(item => item.id !== id)
      this.history.unshift({ ...order, status: 'Cancelada' })
      this.notify(`Ordem de ${order.pair} cancelada.`)
    },
    executeOrder(id) {
      const order = this.pendingOrders.find(item => item.id === id)
      if (!order) return
      this.pendingOrders = this.pendingOrders.filter(item => item.id !== id)
      this.recordOperation(order.type, order.value, order.pair)
      this.activeTab = 'operations'
    },
    closeOperation(id) {
      const operation = this.operations.find(item => item.id === id)
      if (!operation) return
      this.operations = this.operations.filter(item => item.id !== id)
      this.history.unshift({ ...operation, active: false, status: 'Encerrada' })
      this.notify(`Simulação de ${operation.pair} encerrada sem liquidação financeira.`)
    },
    setActiveTab(tab) {
      this.activeTab = tab
    },
    incrementAmount() {
      this.tradeAmount = Math.min(9999, this.tradeAmount + 1)
    },
    decrementAmount() {
      this.tradeAmount = Math.max(1, this.tradeAmount - 1)
    },
    setTradeAmount(value) {
      const parsed = Number(value)
      if (Number.isFinite(parsed) && parsed >= 1) {
        this.tradeAmount = Math.min(9999, Math.round(parsed * 100) / 100)
      }
    },
    placeOrder(type) {
      this.recordOperation(type, this.tradeAmount, this.assetPair)
    },
    recordOperation(type, amount, pair) {
      if (!['buy', 'sell'].includes(type)) return
      if (!Number.isFinite(amount) || amount < 1 || amount > 9999) return
      const now = new Date()
      const time = now.toLocaleTimeString('pt-BR', { hour12: false })
      this.operations.unshift({
        id: crypto.randomUUID(),
        pair,
        value: amount,
        time,
        type,
        active: true,
      })
      this.operations = this.operations.map((op, i) => ({
        ...op,
        active: i === 0,
      }))
      if (type === 'buy') {
        this.footerStats.buyTotal += amount
      } else {
        this.footerStats.sellTotal += amount
      }
      this.notify(`Simulação de ${type === 'buy' ? 'compra' : 'venda'} registrada para ${pair}.`)
    },
  },
})
