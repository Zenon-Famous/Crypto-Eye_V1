<template>
  <div class="trading-dashboard d-flex flex-column">

    <div class="trading-dashboard__body d-flex">
      <main class="trading-dashboard__chart" aria-label="Gráfico de mercado">
        <DefaultGrafBars />
      </main>
      <TradingPanel />
    </div>
  </div>
</template>

<script setup>

import TradingPanel from '@/components/trading/TradingPanel.vue'
import DefaultGrafBars from '@/components/DefaultGrafBars.vue'
</script>

<style lang="scss" scoped>
.trading-dashboard {
  width: 100%;
  flex: 1; min-height: 0;
  overflow: hidden;
  background: var(--bg-primary);
  &__body { flex: 1; min-height: 0; }
  &__chart { flex: 1; min-width: 0; min-height: 0; }
}
@media (max-width: 760px) {
  .trading-dashboard {
    height: auto;
    &__body { flex-direction: column; }
    &__chart { height: 55dvh; min-height: 320px; flex: none; }
  }
}
</style>
