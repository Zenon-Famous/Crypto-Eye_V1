<template>
  <div class="chart-wrapper">
    <div class="chart-toolbar d-flex align-items-center">
      <button type="button" class="chart-toolbar__btn">Indicadores</button>
      <span class="chart-toolbar__pair">{{ pairLabel }}</span>
    </div>
    <div ref="chartContainer" class="chart-container" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { createChart, CandlestickSeries, HistogramSeries } from 'lightweight-charts'
import { useBinanceStore } from '@/stores/binanceWebSocket.store'
import { useBinanceHistoryStore } from '@/stores/binanceHistory.store'
import { useTradingUiStore } from '@/stores/tradingUi.store'

const chartContainer = ref(null)
const chart = ref(null)
const candleSeries = ref(null)
const volumeSeries = ref(null)

const wsStore = useBinanceStore()
const historyStore = useBinanceHistoryStore()
const tradingUi = useTradingUiStore()

const pairLabel = computed(() => tradingUi.assetPair)

const UP_COLOR = '#00c582'
const DOWN_COLOR = '#ff2d55'

function initChart() {
  chart.value = createChart(chartContainer.value, {
    layout: {
      background: { color: '#0a0a0b' },
      textColor: '#8b9299',
    },
    grid: {
      vertLines: { color: '#1a1d24' },
      horzLines: { color: '#1a1d24' },
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

  candleSeries.value = chart.value.addSeries(CandlestickSeries, {
    upColor: UP_COLOR,
    downColor: DOWN_COLOR,
    borderVisible: false,
    wickUpColor: UP_COLOR,
    wickDownColor: DOWN_COLOR,
  })

  volumeSeries.value = chart.value.addSeries(HistogramSeries, {
    priceFormat: { type: 'volume' },
    priceScaleId: 'volume',
  })

  chart.value.priceScale('volume').applyOptions({
    scaleMargins: { top: 0.85, bottom: 0 },
  })

  const resizeObserver = new ResizeObserver(() => {
    if (chartContainer.value && chart.value) {
      chart.value.applyOptions({
        width: chartContainer.value.clientWidth,
        height: chartContainer.value.clientHeight,
      })
    }
  })
  resizeObserver.observe(chartContainer.value)
  chart.value._resizeObserver = resizeObserver
}

function mapCandles(candles) {
  return candles.map((c) => ({
    time: Math.floor(c.x.getTime() / 1000),
    open: c.y[0],
    high: c.y[1],
    low: c.y[2],
    close: c.y[3],
  }))
}

function mapVolume(candles) {
  return candles.map((c) => {
    const isUp = c.y[3] >= c.y[0]
    return {
      time: Math.floor(c.x.getTime() / 1000),
      value: c.volume ?? Math.abs(c.y[1] - c.y[2]) * 10,
      color: isUp ? 'rgba(0, 197, 130, 0.5)' : 'rgba(255, 45, 85, 0.5)',
    }
  })
}

function loadHistory() {
  const candles = historyStore.cryptosHistory
  if (!candles.length) return
  candleSeries.value.setData(mapCandles(candles))
  volumeSeries.value.setData(mapVolume(candles))
  chart.value.timeScale().fitContent()
}

function updateRealtimeCandles() {
  const realtime = wsStore.cryptosRealtime
  if (!realtime?.length) return

  realtime.forEach((candle) => {
    const time = Math.floor(candle.x.getTime() / 1000)
    const isUp = candle.y[3] >= candle.y[0]
    candleSeries.value?.update({
      time,
      open: candle.y[0],
      high: candle.y[1],
      low: candle.y[2],
      close: candle.y[3],
    })
    volumeSeries.value?.update({
      time,
      value: candle.volume ?? Math.abs(candle.y[1] - candle.y[2]) * 10,
      color: isUp ? 'rgba(0, 197, 130, 0.5)' : 'rgba(255, 45, 85, 0.5)',
    })
  })
}

const combinedCandles = computed(() => {
  const hist = historyStore.cryptosHistory
  const realtime = wsStore.cryptosRealtime

  if (!hist.length) return realtime

  const histFiltered = hist.filter(
    (h) => !realtime.some((r) => r.x.getTime() === h.x.getTime()),
  )

  return [...histFiltered, ...realtime].sort((a, b) => a.x - b.x)
})

onMounted(async () => {
  initChart()
  loadHistory()

  wsStore.connect('BTCUSDT', '1m')

  wsStore.socket?.addEventListener('message', () => {
    updateRealtimeCandles()
  })
})

onUnmounted(() => {
  chart.value?._resizeObserver?.disconnect()
  wsStore.disconnect()
})

watch(combinedCandles, (newCandles) => {
  if (!newCandles.length) return
  candleSeries.value?.setData(mapCandles(newCandles))
  volumeSeries.value?.setData(mapVolume(newCandles))
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

  &__btn {
    padding: 4px 12px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--bg-elevated);
    color: var(--text-muted);
    font-size: 0.75rem;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;

    &:hover {
      color: var(--text-color);
      border-color: var(--text-muted);
    }
  }

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
