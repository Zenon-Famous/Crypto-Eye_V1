<template>
  <div class="operations-table">
    <table>
      <thead>
        <tr>
          <th>Valor</th>
          <th>Tempo</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="op in operations"
          :key="op.id"
          :class="[
            `operations-table__row--${op.type}`,
            { 'operations-table__row--active': op.active },
          ]"
        >
          <td>${{ op.value.toFixed(2) }}</td>
          <td>{{ op.time }}</td>
        </tr>
        <tr v-if="!operations.length">
          <td colspan="2" class="operations-table__empty">Nenhuma operação</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  operations: {
    type: Array,
    default: () => [],
  },
})
</script>

<style lang="scss" scoped>
.operations-table {
  flex: 1;
  overflow-y: auto;
  min-height: 0;

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.75rem;
  }

  th {
    position: sticky;
    top: 0;
    padding: 8px 12px;
    text-align: left;
    font-weight: 500;
    color: var(--text-muted);
    background: var(--bg-panel);
    border-bottom: 1px solid var(--border-color);
  }

  td {
    padding: 8px 12px;
    color: var(--text-color);
    border-bottom: 1px solid var(--border-subtle);
  }

  &__row--buy.operations-table__row--active {
    background: rgba(0, 197, 130, 0.12);
  }

  &__row--sell.operations-table__row--active {
    background: rgba(255, 45, 85, 0.12);
  }

  &__empty {
    text-align: center;
    color: var(--text-muted);
    padding: 24px !important;
  }
}
</style>
