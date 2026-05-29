import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useCandleCountdown(intervalMs = 60_000) {
  const secondsLeft = ref(0)
  let timer = null

  function tick() {
    const now = Date.now()
    const elapsed = now % intervalMs
    secondsLeft.value = Math.floor((intervalMs - elapsed) / 1000)
  }

  const formatted = computed(() => {
    const m = Math.floor(secondsLeft.value / 60)
    const s = secondsLeft.value % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  })

  onMounted(() => {
    tick()
    timer = setInterval(tick, 1000)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  return { secondsLeft, formatted }
}
