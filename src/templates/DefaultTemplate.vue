<template>
  <div class="platform-shell">
    <TheNavbar /><p v-if="ui.persistenceError" class="storage-warning" role="alert">{{ ui.persistenceError }}</p><p v-if="quoteError" class="storage-warning" role="status">{{ quoteError }}</p>
    <router-view />
  </div>
</template>
<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import http from '@/services/httpBinance'
import { useTradingUiStore } from '@/stores/tradingUi.store'
import TheNavbar from '@/components/layout/TheNavbar.vue'
const ui = useTradingUiStore()
const quoteError = ref('')
let timer, stopped = false, busy = false
const controller = new AbortController()
async function refreshQuotes() {
  if (busy || stopped) return
  busy = true
  try {
    const { data } = await http.get('/ticker/price', { params: { symbols: JSON.stringify(['BTCUSDT','ETHUSDT','SOLUSDT','BNBUSDT']) }, signal: controller.signal })
    if (stopped) return
    for (const quote of data) ui.updateQuote(quote.symbol.replace(/USDT$/, '/USDT'), Number(quote.price))
    quoteError.value = ''
  } catch { if (!stopped) quoteError.value = 'Cotações indisponíveis. Ordens limitadas serão verificadas quando a conexão retornar.' }
  finally { busy = false }
}
onMounted(() => { refreshQuotes(); timer = setInterval(refreshQuotes,10000) })
onUnmounted(() => { stopped = true; clearInterval(timer); controller.abort() })
</script>
<style scoped>
.platform-shell { min-height: 100dvh; height: 100dvh; display: flex; flex-direction: column; }
@media(max-width:760px) { .platform-shell { height: auto; } }
.storage-warning { margin: 0; padding: 8px 16px; background: var(--bg-elevated); color: var(--text-color); font-size: 0.8rem; }
</style>
