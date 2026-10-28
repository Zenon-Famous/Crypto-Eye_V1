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
      if (!['buy', 'sell'].includes(type)) return
      const now = new Date()
      const time = now.toLocaleTimeString('pt-BR', { hour12: false })
      this.operations.unshift({
        id: crypto.randomUUID(),
        pair: this.assetPair,
        value: this.tradeAmount,
        time,
        type,
        active: true,
      })
      this.operations = this.operations.map((op, i) => ({
        ...op,
        active: i === 0,
      }))
      if (type === 'buy') {
        this.footerStats.buyTotal += this.tradeAmount
      } else {
        this.footerStats.sellTotal += this.tradeAmount
      }
    },
  },
})
