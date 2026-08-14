<template>
  <header class="navbar-trading d-flex align-items-center">
    <div class="navbar-trading__left d-flex align-items-center">
      <span class="navbar-trading__logo">crypto eye</span>
      <nav class="navbar-trading__menu d-flex">
        <a
          v-for="item in menuItems"
          :key="item"
          href="#"
          class="navbar-trading__link"
          @click.prevent
        >
          {{ item }}
          <span v-if="item === 'Mais'" class="navbar-trading__chevron">▾</span>
        </a>
      </nav>
    </div>

    <div class="navbar-trading__center d-flex align-items-center">
      <div class="asset-badge">
        <span class="asset-badge__pair">{{ binanceStore.currentPair }}</span>
        <span class="asset-badge__tag">{{ ui.assetTag }}</span>
      </div>
      <span class="navbar-trading__volume">
        Vol. 24h <strong>{{ ui.formattedVolume }}</strong>
      </span>
    </div>

    <div class="navbar-trading__right d-flex align-items-center">
      <button class="navbar-trading__icon-btn" type="button" aria-label="Notificações">
        <i class="icon-bell" aria-hidden="true" />
      </button>
      <button class="navbar-trading__icon-btn" type="button" aria-label="Perfil">
        <i class="icon-person" aria-hidden="true" />
      </button>
      <div class="navbar-trading__balance">
        <span class="navbar-trading__balance-label">Conta Real</span>
        <span class="navbar-trading__balance-value">${{ ui.balance.toFixed(2) }}</span>
      </div>
      <button class="navbar-trading__deposit btn" type="button">Depositar</button>
    </div>
  </header>
</template>

<script setup>
import { useTradingUiStore } from '@/stores/tradingUi.store';
import { useBinanceStore } from '@/stores/binanceWebSocket.store';

const ui = useTradingUiStore()
const binanceStore = useBinanceStore()
const menuItems = ['Trade', 'Comprar Cripto', 'Educação', 'Mais']
</script>

<style lang="scss" scoped>
.navbar-trading {
  height: 52px;
  padding: 0 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  gap: 24px;
  flex-shrink: 0;

  &__left {
    gap: 28px;
    flex-shrink: 0;
  }

  &__logo {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--green);
    text-transform: lowercase;
    letter-spacing: -0.02em;
  }

  &__menu {
    gap: 20px;
  }

  &__link {
    color: var(--text-muted);
    font-size: 0.8rem;
    text-decoration: none;
    transition: color 0.15s;

    &:hover {
      color: var(--text-color);
    }
  }

  &__chevron {
    font-size: 0.65rem;
    margin-left: 2px;
  }

  &__center {
    flex: 1;
    gap: 16px;
    min-width: 0;
  }

  &__volume {
    font-size: 0.75rem;
    color: var(--text-muted);

    strong {
      color: var(--text-color);
      font-weight: 500;
    }
  }

  &__right {
    gap: 12px;
    flex-shrink: 0;
  }

  &__icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: var(--text-muted);
    cursor: pointer;
    transition: background 0.15s, color 0.15s;

    &:hover {
      background: var(--bg-elevated);
      color: var(--text-color);
    }

    i {
      font-size: 18px;
      line-height: 1;
    }
  }

  &__balance {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    line-height: 1.2;
  }

  &__balance-label {
    font-size: 0.65rem;
    color: var(--text-muted);
  }

  &__balance-value {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-color);
  }

  &__deposit {
    padding: 8px 18px;
    border: none;
    border-radius: 8px;
    background: var(--green);
    color: #000;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: filter 0.15s;

    &:hover {
      filter: brightness(1.08);
    }
  }
}

.asset-badge {
  display: flex;
  align-items: center;
  gap: 8px;

  &__pair {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-color);
  }

  &__tag {
    font-size: 0.65rem;
    padding: 2px 8px;
    border-radius: 4px;
    background: var(--bg-elevated);
    color: var(--text-muted);
    border: 1px solid var(--border-color);
  }
}
</style>
