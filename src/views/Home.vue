<template>
    <DefaultGrafBars :data="data" />
</template>
<script setup>
import { onMounted, onUnmounted, computed } from 'vue';
import { useBinanceStore } from '@/stores/webSocket.store';
import DefaultGrafBars from '../components/DefaultGrafBars.vue'
import { storeToRefs } from "pinia";

const binanceStore = useBinanceStore();
const { cryptos } = storeToRefs(binanceStore);

const data = computed(() => [
  {
    name: cryptos.value.name,
    data: cryptos.value
  }
])


onMounted(() => {
    binanceStore.connect('BTCUSDT', '1m');
})

// onUnmounted(() => {
//     binanceStore.disconnect();
// })

</script>
<style scoped>

</style>