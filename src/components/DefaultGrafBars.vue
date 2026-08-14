<template>
  <div class="chart-wrapper">
    <div class="chart-toolbar d-flex align-items-center">
      <el-dialog
      width="400px"
      destroy-on-close
      >
      <ExchangeModal />
      </el-dialog>

      <span class="chart-toolbar__pair">
        {{ pairLabel }}
      </span>
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
  computed,
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
import { useBinanceExchangeInfoStore } from '@/stores/binanceExchangeInfo.store'
import ExchangeModal from './trading/ExchangeModal.vue'

const chartContainer = ref(null)

const chart = ref(null)
const candleSeries = ref(null)
const volumeSeries = ref(null)

const wsStore = useBinanceStore()
const historyStore = useBinanceHistoryStore()
const exchangeInfoStore = useBinanceExchangeInfoStore()

const selectedPair = ref('BTCUSDT');
const emit = defineEmits(['loading'])

const pairLabel = computed(() => selectedPair.value)

const cryptos = computed(() => {
  return (
    exchangeInfoStore.exchangeInfo?.symbols
      ?.filter(
        (symbol) => symbol.status === 'TRADING',
      )
      .map(
        (symbol) => symbol.symbol,
      ) || []
  )
})

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

  const resizeObserver = new ResizeObserver(() => {
    if (!chart.value || !chartContainer.value) return

    chart.value.applyOptions({
      width: chartContainer.value.clientWidth,
      height: chartContainer.value.clientHeight,
    })
  })

  resizeObserver.observe(chartContainer.value)

  chart.value._resizeObserver = resizeObserver
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

function handleSocketMessage() {
  updateRealtimeCandles()
}

async function changePair(pair) {
  try {
    wsStore.socket?.removeEventListener(
      'message',
      handleSocketMessage,
    )

    wsStore.disconnect()

    const endTime = Date.now()

    const startTime =
      endTime - 24 * 60 * 60 * 10000

    await historyStore.getHistory(
      pair,
      '1m',
      startTime,
      endTime,
    )

    loadHistory()

    wsStore.connect(pair, '1m')

    wsStore.socket?.addEventListener(
      'message',
      handleSocketMessage,
    )
  } catch (error) {
    return error
  }
}

onMounted(async () => {
  initChart()

  loadHistory()

  wsStore.connect(
    selectedPair.value,
    '1m',
  )

  wsStore.socket?.addEventListener(
    'message',
    handleSocketMessage,
  )
})

onUnmounted(() => {
  wsStore.socket?.removeEventListener(
    'message',
    handleSocketMessage,
  )

  chart.value?._resizeObserver?.disconnect()

  wsStore.disconnect()
})

watch(selectedPair, async (newPair) => {
  emit('loading', true)

  try {
    await changePair(newPair)
  } finally {
    emit('loading', false)
  }
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
  gap: 12px;
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