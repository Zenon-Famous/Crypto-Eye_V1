<template>
  <aside class="trading-panel d-flex flex-column">
    <div class="trading-panel__header">
      <div class="trading-panel__asset">
        <span class="trading-panel__pair">{{ ui.assetPair }}</span>
        <span class="trading-panel__timeframe">{{ ui.timeframe }}</span>
      </div>
      <div class="trading-panel__countdown" :title="'Tempo restante do candle'">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>{{ countdown }}</span>
      </div>
    </div>

    <div class="trading-panel__amount">
      <label class="trading-panel__label">Valor (US$)</label>
      <div class="amount-input d-flex align-items-center">
        <button type="button" class="amount-input__btn" @click="ui.decrementAmount()">−</button>
        <input
          type="number"
          class="amount-input__field"
          :value="ui.tradeAmount"
          min="1"
          @input="onAmountInput"
        />
        <button type="button" class="amount-input__btn" @click="ui.incrementAmount()">+</button>
      </div>
    </div>

    <div class="trading-panel__profit">
      <span class="trading-panel__profit-label">Receita +{{ ui.profitPercent }}%</span>
      <span class="trading-panel__profit-value">+${{ ui.potentialReturn }}</span>
    </div>

    <div class="trading-panel__actions d-flex flex-column gap-2">
      <button type="button" class="btn-order btn-order--buy" @click="ui.placeOrder('buy')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="18 15 12 9 6 15" />
        </svg>
        COMPRAR
      </button>
      <button type="button" class="btn-order btn-order--sell" @click="ui.placeOrder('sell')">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
        VENDER
      </button>
    </div>

    <div class="trading-panel__tabs d-flex">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="trading-panel__tab"
        :class="{ 'trading-panel__tab--active': ui.activeTab === tab.id }"
        @click="ui.setActiveTab(tab.id)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="trading-panel__content flex-grow-1 d-flex flex-column">
      <OperationsTable v-if="ui.activeTab === 'operations'" :operations="ui.operations" />
      <div v-else-if="ui.activeTab === 'orders'" class="trading-panel__placeholder">
        Nenhuma ordem pendente
      </div>
      <div v-else class="trading-panel__placeholder">
        Histórico vazio
      </div>
    </div>

    <div class="trading-panel__footer">
      <div class="trading-panel__footer-labels d-flex justify-content-between">
        <span class="text-buy">${{ ui.footerStats.buyTotal.toFixed(2) }}</span>
        <span class="text-muted">vs</span>
        <span class="text-sell">${{ ui.footerStats.sellTotal.toFixed(2) }}</span>
      </div>
      <div class="trading-panel__footer-bars d-flex">
        <div
          class="trading-panel__bar trading-panel__bar--buy"
          :style="{ flex: buyBarFlex }"
        />
        <div
          class="trading-panel__bar trading-panel__bar--sell"
          :style="{ flex: sellBarFlex }"
        />
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useTradingUiStore } from '@/stores/tradingUi.store'
import { useCandleCountdown } from '@/composables/useCandleCountdown'
import OperationsTable from './OperationsTable.vue'

const ui = useTradingUiStore()
const { formatted: countdown } = useCandleCountdown(60_000)

const tabs = [
  { id: 'operations', label: 'Operações' },
  { id: 'orders', label: 'Ordens' },
  { id: 'history', label: 'Histórico' },
]

const buyBarFlex = computed(() => {
  const total = ui.footerStats.buyTotal + ui.footerStats.sellTotal
  return total === 0 ? 1 : ui.footerStats.buyTotal
})

const sellBarFlex = computed(() => {
  const total = ui.footerStats.buyTotal + ui.footerStats.sellTotal
  return total === 0 ? 1 : ui.footerStats.sellTotal
})

function onAmountInput(event) {
  ui.setTradeAmount(event.target.value)
}
</script>

<style lang="scss" scoped>
.trading-panel {
  width: 280px;
  min-width: 280px;
  height: 100%;
  background: var(--bg-panel);
  border-left: 1px solid var(--border-color);
  padding: 16px 14px 12px;
  flex-shrink: 0;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  &__asset {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__pair {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-color);
  }

  &__timeframe {
    font-size: 0.7rem;
    color: var(--text-muted);
  }

  &__countdown {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 20px;
    background: var(--bg-elevated);
    border: 1px solid var(--border-color);
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--text-color);
    font-variant-numeric: tabular-nums;
  }

  &__amount {
    margin-bottom: 12px;
  }

  &__label {
    display: block;
    font-size: 0.7rem;
    color: var(--text-muted);
    margin-bottom: 6px;
  }

  &__profit {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px;
    margin-bottom: 14px;
    border-radius: 8px;
    background: var(--bg-elevated);
    border: 1px solid var(--border-color);
  }

  &__profit-label {
    font-size: 0.75rem;
    color: var(--green);
    font-weight: 500;
  }

  &__profit-value {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--green);
    margin-top: 2px;
  }

  &__actions {
    margin-bottom: 16px;
  }

  &__tabs {
    border-bottom: 1px solid var(--border-color);
    margin-bottom: 8px;
  }

  &__tab {
    flex: 1;
    padding: 8px 4px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    font-size: 0.72rem;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: color 0.15s, border-color 0.15s;

    &--active {
      color: var(--text-color);
      border-bottom-color: var(--green);
    }

    &:hover:not(&--active) {
      color: var(--text-color);
    }
  }

  &__content {
    min-height: 0;
    overflow: hidden;
  }

  &__placeholder {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  &__footer {
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px solid var(--border-color);
  }

  &__footer-labels {
    font-size: 0.75rem;
    margin-bottom: 6px;
  }

  &__footer-bars {
    height: 4px;
    border-radius: 2px;
    overflow: hidden;
    gap: 2px;
  }

  &__bar {
    min-width: 4px;
    border-radius: 2px;

    &--buy {
      background: var(--green);
    }

    &--sell {
      background: var(--red);
    }
  }
}

.amount-input {
  background: var(--bg-elevated);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;

  &__btn {
    width: 40px;
    height: 40px;
    border: none;
    background: transparent;
    color: var(--text-muted);
    font-size: 1.2rem;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;

    &:hover {
      background: var(--bg-secondary);
      color: var(--text-color);
    }
  }

  &__field {
    flex: 1;
    border: none;
    background: transparent;
    text-align: center;
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-color);
    outline: none;
    -moz-appearance: textfield;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }
}

.btn-order {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: filter 0.15s, transform 0.1s;

  &:active {
    transform: scale(0.98);
  }

  &--buy {
    background: var(--green);
    color: #000;
  }

  &--sell {
    background: var(--red);
    color: #fff;
  }

  &:hover {
    filter: brightness(1.06);
  }
}

.text-buy {
  color: var(--green);
}

.text-sell {
  color: var(--red);
}

.text-muted {
  color: var(--text-muted);
}
</style>
