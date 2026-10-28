<template>
  <div class="platform-shell">
    <TheNavbar />
    <router-view />
  </div>
</template>
<script setup>
import TheNavbar from '@/components/layout/TheNavbar.vue'
</script>
<style scoped>
.platform-shell { min-height: 100dvh; height: 100dvh; display: flex; flex-direction: column; }
@media(max-width:760px) { .platform-shell { height: auto; } }
</style>
