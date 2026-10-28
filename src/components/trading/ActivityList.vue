<template>
  <div class="activity-list">
    <p v-if="!items.length" class="activity-empty">{{ empty }}</p>
    <article v-for="item in items" :key="item.id" class="activity-item">
      <div><strong>{{ item.pair }}</strong> <span>{{ item.type === 'buy' ? 'Compra' : 'Venda' }}</span></div>
      <div class="activity-meta"><span>US$ {{ item.value.toFixed(2) }}</span><time>{{ item.time }}</time><span v-if="item.status">{{ item.status }}</span></div>
      <div v-if="mode === 'orders'" class="activity-actions"><button type="button" @click="ui.executeOrder(item.id)">Executar simulação</button><button type="button" @click="ui.cancelOrder(item.id)">Cancelar</button></div>
      <button v-else-if="mode === 'operations'" type="button" @click="ui.closeOperation(item.id)">Encerrar simulação</button>
    </article>
  </div>
</template>
<script setup>
import { useTradingUiStore } from '@/stores/tradingUi.store'
defineProps({ items: { type: Array, default: () => [] }, mode: String, empty: String })
const ui = useTradingUiStore()
</script>
<style scoped>
.activity-list { overflow: auto; min-height: 0; flex: 1; }
.activity-item { border-bottom: 1px solid var(--border-color); padding: 14px 0; font-size: 0.8rem; }
.activity-item strong { color: var(--text-color); }
.activity-item span, time { color: var(--text-muted); }
.activity-meta, .activity-actions { display: flex; flex-wrap: wrap; gap: 10px; margin: 8px 0; }
button { background: transparent; border: 1px solid var(--border-color); color: var(--text-color); padding: 8px; border-radius: 6px; font-size: 0.75rem; }
button:hover { border-color: var(--green); }
.activity-empty { text-align: center; color: var(--text-muted); padding: 24px 0; font-size: 0.8rem; }
</style>
