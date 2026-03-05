<template>
  <div ref="chartContainer" style="width:100%; height:100vh"></div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { createChart, CandlestickSeries } from 'lightweight-charts'
import { useBinanceStore } from '@/stores/binanceWebSocket.store'
import { useBinanceHistoryStore } from '@/stores/binanceHistory.store'

const chartContainer = ref(null)
const chart = ref(null)
const candleSeries = ref(null)

const wsStore = useBinanceStore()
const historyStore = useBinanceHistoryStore()

function initChart() {
  chart.value = createChart(chartContainer.value, {
    layout: {
      background: { color: '#0f1116' },
      textColor: '#d1d4dc'
    },
    grid: {
      vertLines: { color: 'transparent' },
      horzLines: { color: 'transparent' }
    },
    rightPriceScale: {
      borderColor: '#2a2e39'
    },
    timeScale: {
      borderColor: '#2a2e39',
      timeVisible: true,
      secondsVisible: false,
      rightOffset: 20
    },
    localization: {
      locale: 'pt-BR'
    }
  })

  candleSeries.value = chart.value.addSeries(CandlestickSeries, {
    upColor: '#00E5FF',
    downColor: '#FF1744',
    borderVisible: false,
    wickUpColor: '#00E5FF',
    wickDownColor: '#FF1744'
  })
}

function mapCandles(candles) {
  return candles.map(c => ({
    time: Math.floor(c.x.getTime() / 1000),
    open: c.y[0],
    high: c.y[1],
    low: c.y[2],
    close: c.y[3]
  }))
}

function loadHistory() {
  const historyData = mapCandles(historyStore.cryptosHistory)
  candleSeries.value.setData(historyData)
}

function updateRealtimeCandles() {
  const realtime = wsStore.cryptosRealtime
  if (!realtime || !realtime.length) return  // <-- evita erro

  realtime.forEach(candle => {
    candleSeries.value.update({
      time: Math.floor(candle.x.getTime() / 1000),
      open: candle.y[0],
      high: candle.y[1],
      low: candle.y[2],
      close: candle.y[3]
    })
  })
}

const combinedCandles = computed(() => {
  const hist = historyStore.cryptosHistory
  const realtime = wsStore.cryptosRealtime

  if (!hist.length) return realtime

  const histFiltered = hist.filter(h => !realtime.some(r => r.x.getTime() === h.x.getTime()))

  return [...histFiltered, ...realtime].sort((a, b) => a.x - b.x)
})

onMounted(async () => {
  initChart()

  loadHistory()

  wsStore.connect('BTCUSDT', '1m')

  wsStore.socket.addEventListener('message', () => {
    updateRealtimeCandles()
  })
})
watch(combinedCandles, (newCandles) => {
  const data = mapCandles(newCandles)
  candleSeries.value.setData(data)
})
</script>