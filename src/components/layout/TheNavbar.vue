<template>
  <header class="navbar-trading d-flex align-items-center">
    <div class="navbar-trading__left d-flex align-items-center">
      <RouterLink to="/" class="navbar-trading__logo">crypto eye</RouterLink>
      <nav class="navbar-trading__menu d-flex">
        <RouterLink v-for="item in menuItems" :key="item.to" :to="item.to" class="navbar-trading__link" active-class="navbar-trading__link--active" :exact-active-class="'navbar-trading__link--active'">{{ item.label }}</RouterLink>
      </nav>
    </div>

    <div class="navbar-trading__center d-flex align-items-center">
      <div class="asset-badge">
        <span class="asset-badge__pair">{{ ui.assetPair }}</span>
        <span class="asset-badge__tag">{{ ui.assetTag }}</span>
      </div>
      <span class="navbar-trading__volume">
        Ambiente de simulação
      </span>
    </div>

    <div class="navbar-trading__right d-flex align-items-center">
      <RouterLink to="/notificacoes" class="navbar-trading__icon-btn" aria-label="Notificações">
        <i class="icon-bell" aria-hidden="true" />
      </RouterLink>
      <RouterLink to="/perfil" class="navbar-trading__icon-btn" aria-label="Perfil">
        <i class="icon-person" aria-hidden="true" />
      </RouterLink>
      <div class="navbar-trading__balance">
        <span class="navbar-trading__balance-label">Conta demonstrativa</span>
        <span class="navbar-trading__balance-value">{{ ui.availableBalance.toFixed(2) }} USDT</span>
      </div>
      <RouterLink to="/carteira" class="navbar-trading__deposit btn">Saldo demo</RouterLink>
    </div>
  </header>
</template>

<script setup>
import { useTradingUiStore } from '@/stores/tradingUi.store';


const ui = useTradingUiStore()

const menuItems = [{ label: 'Trade', to: '/' }, { label: 'Comprar Cripto', to: '/comprar' }, { label: 'Educação', to: '/educacao' }, { label: 'Mais', to: '/mais' }]
</script>

<style lang="scss" scoped>
.navbar-trading {
  min-height: 60px;
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
    text-decoration: none;
    letter-spacing: -0.02em;
  }

  &__menu {
    gap: 20px;
  }

  &__link--active { color: var(--green); }

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
