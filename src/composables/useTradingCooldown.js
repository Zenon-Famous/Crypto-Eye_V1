import { computed, onUnmounted, ref } from 'vue'
import { useTradingUiStore } from '@/stores/tradingUi.store'
export function useTradingCooldown() {
  const ui = useTradingUiStore()
  const now = ref(Date.now())
  const timer = setInterval(() => { now.value = Date.now() }, 250)
  onUnmounted(() => clearInterval(timer))
  const remaining = computed(() => ui.cooldownRemaining(now.value))
  const label = computed(() => 'Próxima ação em ' + String(Math.floor(remaining.value / 60)).padStart(2,'0') + ':' + String(remaining.value % 60).padStart(2,'0'))
  return { remaining, label }
}
