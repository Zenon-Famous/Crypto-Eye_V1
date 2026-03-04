<script setup>
import DefaultTemplate from './templates/DefaultTemplate.vue';
import { useRoute } from 'vue-router';

const templates = {
  DefaultTemplate,
}

const route = useRoute();
console.log(route)
</script>

<template>
  <div>
    <component :is="templates[route.meta.template]">
      <router-view/>
    </component>
  </div>
</template>

<style lang="scss" scoped>

</style>
