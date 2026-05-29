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
      <span v-html="tool.icon" />
    </button>
    <div class="sidebar-tools__spacer" />
    <button
      type="button"
      class="sidebar-tools__btn sidebar-tools__btn--danger"
      title="Limpar desenhos"
      aria-label="Limpar desenhos"
      @click="activeTool = null"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
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
    icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/></svg>',
  },
  {
    id: 'trend',
    label: 'Linha de tendência',
    icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="20" x2="20" y2="4"/></svg>',
  },
  {
    id: 'horizontal',
    label: 'Linha horizontal',
    icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/></svg>',
  },
  {
    id: 'fibonacci',
    label: 'Fibonacci',
    icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20V4M4 20h16M4 14h10M4 8h6"/></svg>',
  },
  {
    id: 'text',
    label: 'Texto',
    icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="12" y1="4" x2="12" y2="20"/><line x1="8" y1="20" x2="16" y2="20"/></svg>',
  },
  {
    id: 'shape',
    label: 'Formas',
    icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>',
  },
  {
    id: 'measure',
    label: 'Medição',
    icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h5M17 12h5M7 8v8M17 8v8"/></svg>',
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
  }

  &__spacer {
    flex: 1;
    min-height: 16px;
  }
}
</style>
