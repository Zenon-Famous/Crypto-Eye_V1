<template>
  <div>
    <DefaultGrafBars v-if="loaded" />
    <div v-else class="loading">Carregando gráfico...</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBinanceHistoryStore } from '@/stores/binanceHistory.store'
import DefaultGrafBars from '../components/DefaultGrafBars.vue'

const binanceStore = useBinanceHistoryStore()
const loaded = ref(false)

onMounted(async () => {
  const endTime = Date.now();
  const startTime = endTime - 24 * 60 * 60 * 10000;

  await binanceStore.getHistory('BTCUSDT', '1m', startTime, endTime)
  loaded.value = true
})
</script>

<style scoped>
.loading {
  color: #fff;
  text-align: center;
  padding: 50px;
}
</style>