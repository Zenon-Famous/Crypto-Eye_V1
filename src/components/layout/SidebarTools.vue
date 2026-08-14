<template>
  <aside class="sidebar-tools d-flex flex-column align-items-center">
    <button
      v-for="tool in tools"
      :key="tool.id"
      type="button"
      class="sidebar-tools__btn"
      :class="{ 'sidebar-tools__btn--active': activeTool === tool.id }"
      :title="tool.label"
      :aria-label="tool.label"
      @click="activeTool = tool.id"
    >
      <i :class="tool.icon" aria-hidden="true" />
    </button>
    <div class="sidebar-tools__spacer" />
    <button
      type="button"
      class="sidebar-tools__btn sidebar-tools__btn--danger"
      title="Limpar desenhos"
      aria-label="Limpar desenhos"
      @click="activeTool = null"
    >
      <i class="icon-trash" aria-hidden="true" />
    </button>
  </aside>
</template>

<script setup>
import { ref } from 'vue'

const activeTool = ref('cursor')

const tools = [
  {
    id: 'cursor',
    label: 'Cursor',
    icon: 'icon-cursor',
  },
  {
    id: 'trend',
    label: 'Linha de tendência',
    icon: 'icon-slash',
  },
  {
    id: 'horizontal',
    label: 'Linha horizontal',
    icon: 'icon-dash-lg',
  },
  {
    id: 'fibonacci',
    label: 'Fibonacci',
    icon: 'icon-bar-chart-line',
  },
  {
    id: 'text',
    label: 'Texto',
    icon: 'icon-type-bold',
  },
  {
    id: 'shape',
    label: 'Formas',
    icon: 'icon-square',
  },
  {
    id: 'measure',
    label: 'Medição',
    icon: 'icon-layout-split',
  },
]
</script>

<style lang="scss" scoped>
.sidebar-tools {
  width: 44px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  padding: 8px 0;
  flex-shrink: 0;

  &__btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    margin: 2px 0;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    transition: background 0.15s, color 0.15s;

    &:hover,
    &--active {
      background: var(--bg-elevated);
      color: var(--text-color);
    }

    &--danger:hover {
      color: var(--red);
    }

    i {
      color: var(--text-muted) !important;
      font-size: 18px;
      line-height: 1;
    }
  }

  &__spacer {
    flex: 1;
    min-height: 16px;
  }
}
</style>
