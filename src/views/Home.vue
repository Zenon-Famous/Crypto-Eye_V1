<template>
  <div class="trading-dashboard d-flex flex-column">
    <TheNavbar />
    <div class="trading-dashboard__body d-flex">
      <SidebarTools />
      <main class="trading-dashboard__chart">
        <DefaultGrafBars v-if="loaded" @loading="(val) => loaded = val" />
        <div v-else class="trading-dashboard__loading">
          <div class="trading-dashboard__spinner" />
          <span>Carregando gráfico...</span>
        </div>
      </main>
      <TradingPanel />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBinanceHistoryStore } from '@/stores/binanceHistory.store'
import { useBinanceExchangeInfoStore } from '@/stores/binanceExchangeInfo.store'
import TheNavbar from '@/components/layout/TheNavbar.vue'
import SidebarTools from '@/components/layout/SidebarTools.vue'
import TradingPanel from '@/components/trading/TradingPanel.vue'
import DefaultGrafBars from '@/components/DefaultGrafBars.vue'

const binanceStore = useBinanceHistoryStore()
const exchangeInfoStore = useBinanceExchangeInfoStore()
const loaded = ref(false)

onMounted(async () => {
  const endTime = Date.now()
  const startTime = endTime - 24 * 60 * 60 * 10000

  await binanceStore.getHistory('BTCUSDT', '1m', startTime, endTime)
  await exchangeInfoStore.getExchangeInfo()
  loaded.value = true
})
</script>

<style lang="scss" scoped>
.trading-dashboard {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-primary);

  &__body {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  &__chart {
    flex: 1;
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }

  &__loading {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: var(--text-muted);
    font-size: 0.9rem;
  }

  &__spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--border-color);
    border-top-color: var(--green);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
