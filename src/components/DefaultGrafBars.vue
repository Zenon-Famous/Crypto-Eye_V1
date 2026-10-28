<template>
  <div class="chart-wrapper">
    <div class="chart-toolbar d-flex align-items-center">
      <label for="market-pair">Mercado</label>
      <select id="market-pair" v-model="selectedPair" :disabled="loading">
        <option v-for="pair in pairs" :key="pair" :value="pair">{{ pair }}</option>
      </select>
      <span>1 min · Binance</span>
      <span v-if="loading" role="status">Carregando cotações…</span>
      <span v-else-if="error" role="alert">{{ error }} <button type="button" @click="changePair(selectedPair)">Tentar novamente</button></span>
    </div>

    <div
      ref="chartContainer"
      class="chart-container"
    />
  </div>
</template>

<script setup>
import {
  ref,
  shallowRef,
  onMounted,
  onUnmounted,
  watch,
} from 'vue'

import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
} from 'lightweight-charts'

import { useBinanceStore } from '@/stores/binanceWebSocket.store'
import { useBinanceHistoryStore } from '@/stores/binanceHistory.store'
import { useTradingUiStore } from '@/stores/tradingUi.store'


const chartContainer = ref(null)

const chart = shallowRef(null)
const candleSeries = shallowRef(null)
const volumeSeries = shallowRef(null)

const wsStore = useBinanceStore()
const historyStore = useBinanceHistoryStore()
const ui = useTradingUiStore()
const selectedPair = ref('BTCUSDT')
const pairs = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT']
const loading = ref(false)
const error = ref('')
let disposed = false
let resizeObserver
const UP_COLOR = '#00c582'
const DOWN_COLOR = '#ff2d55'

function initChart() {
  chart.value = createChart(chartContainer.value, {
    layout: {
      background: {
        color: '#0a0a0b',
      },
      textColor: '#8b9299',
    },

    grid: {
      vertLines: {
        color: '#1a1d24',
      },
      horzLines: {
        color: '#1a1d24',
      },
    },

    rightPriceScale: {
      borderColor: '#2a2e39',
    },

    timeScale: {
      borderColor: '#2a2e39',
      timeVisible: true,
      secondsVisible: false,
      rightOffset: 12,
    },

    localization: {
      locale: 'pt-BR',
    },
  })

  candleSeries.value = chart.value.addSeries(
    CandlestickSeries,
    {
      upColor: UP_COLOR,
      downColor: DOWN_COLOR,
      borderVisible: false,
      wickUpColor: UP_COLOR,
      wickDownColor: DOWN_COLOR,
    },
  )

  volumeSeries.value = chart.value.addSeries(
    HistogramSeries,
    {
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'volume',
    },
  )

  chart.value.priceScale('volume').applyOptions({
    scaleMargins: {
      top: 0.85,
      bottom: 0,
    },
  })

  resizeObserver = new ResizeObserver(() => {
    if (!chart.value || !chartContainer.value) return

    chart.value.applyOptions({
      width: chartContainer.value.clientWidth,
      height: chartContainer.value.clientHeight,
    })
  })

  resizeObserver.observe(chartContainer.value)


}

function mapCandles(candles) {
  return candles.map((candle) => ({
    time: Math.floor(candle.x.getTime() / 1000),
    open: candle.y[0],
    high: candle.y[1],
    low: candle.y[2],
    close: candle.y[3],
  }))
}

function mapVolume(candles) {
  return candles.map((candle) => {
    const isUp = candle.y[3] >= candle.y[0]

    return {
      time: Math.floor(candle.x.getTime() / 1000),

      value:
        candle.volume ??
        Math.abs(candle.y[1] - candle.y[2]) * 10,

      color: isUp
        ? 'rgba(0, 197, 130, 0.5)'
        : 'rgba(255, 45, 85, 0.5)',
    }
  })
}

function loadHistory() {
  const candles = historyStore.cryptosHistory

  if (!candles?.length) return

  candleSeries.value.setData(
    mapCandles(candles),
  )

  volumeSeries.value.setData(
    mapVolume(candles),
  )

  chart.value.timeScale().fitContent()
}

function updateRealtimeCandles() {
  const realtime = wsStore.cryptosRealtime

  if (!realtime?.length) return

  const candle =
    realtime[realtime.length - 1]

  const time = Math.floor(
    candle.x.getTime() / 1000,
  )

  const isUp =
    candle.y[3] >= candle.y[0]

  candleSeries.value?.update({
    time,
    open: candle.y[0],
    high: candle.y[1],
    low: candle.y[2],
    close: candle.y[3],
  })

  volumeSeries.value?.update({
    time,

    value:
      candle.volume ??
      Math.abs(candle.y[1] - candle.y[2]) * 10,

    color: isUp
      ? 'rgba(0, 197, 130, 0.5)'
      : 'rgba(255, 45, 85, 0.5)',
  })
}

async function changePair(pair) {
  if (loading.value || disposed) return
  loading.value = true
  error.value = ''
  wsStore.disconnect()
  candleSeries.value.setData([])
  volumeSeries.value.setData([])
  ui.assetPair = pair.replace(/USDT$/, '/USDT')
  try {
    const endTime = Date.now()
    await historyStore.getHistory(pair, '1m', endTime - 24 * 60 * 60 * 1000, endTime)
    if (disposed) return
    if (!historyStore.cryptosHistory.length) throw new Error('empty history')
    loadHistory()
    wsStore.connect(pair, '1m')
    const socket = wsStore.socket
    socket.addEventListener('error', () => {
      if (!disposed && wsStore.socket === socket) error.value = 'Atualização ao vivo indisponível.'
    })
    socket.addEventListener('close', () => {
      if (!disposed && wsStore.socket === socket) error.value = 'Conexão encerrada. Reconecte para atualizar.'
    })
  } catch {
    if (!disposed) error.value = 'Não foi possível carregar as cotações.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  initChart()
  changePair(selectedPair.value)
})
onUnmounted(() => {
  disposed = true
  resizeObserver?.disconnect()
  wsStore.disconnect()
  chart.value?.remove()
})
watch(selectedPair, changePair)
watch(() => wsStore.cryptosRealtime.at(-1), () => {
  if (!disposed) updateRealtimeCandles()
})
</script>

<style lang="scss" scoped>
.chart-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
  background: var(--bg-primary);
}

.chart-toolbar {
  flex-shrink: 0;
  padding: 8px 12px;
  gap: 12px; flex-wrap: wrap; color: var(--text-muted); font-size: 0.8rem;
  border-bottom: 1px solid var(--border-subtle);

  &__pair {
    font-size: 0.75rem;
    color: var(--text-muted);
  }
}

.chart-container {
  flex: 1;
  min-height: 0;
  width: 100%;
}
</style>
