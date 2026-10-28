export const FEE_RATE = 0.001
export const PAIRS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT']
export const round = n => Math.round((n + Number.EPSILON) * 1e8) / 1e8
const EPS = 1e-8
export function availableCash(account, exceptId) {
  return round(account.balance - account.pendingOrders.filter(o => o.type === 'buy' && o.id !== exceptId).reduce((sum, o) => sum + o.value, 0))
}
export function availableQuantity(account, pair, exceptId) {
  return round((account.holdings[pair]?.quantity || 0) - account.pendingOrders.filter(o => o.type === 'sell' && o.pair === pair && o.id !== exceptId).reduce((sum, o) => sum + o.quantity, 0))
}
export function validateTrade(account, type, value, pair, price, exceptId) {
  if (!['buy', 'sell'].includes(type) || !PAIRS.includes(pair)) throw new Error('Mercado ou lado inválido.')
  if (!Number.isFinite(value) || value < 1 || value > 9999) throw new Error('Informe um valor entre 1 e 9.999 USDT.')
  if (!Number.isFinite(price) || price <= 0) throw new Error('Cotação indisponível. Atualize e tente novamente.')
  if (type === 'buy' && availableCash(account, exceptId) + EPS < value) throw new Error('Saldo USDT disponível insuficiente.')
  if (type === 'sell' && availableQuantity(account, pair, exceptId) + EPS < round(value / price)) throw new Error('Quantidade do ativo disponível insuficiente para vender.')
}
export function settleTrade(account, type, value, pair, price, exceptId, fixedQuantity) {
  // Buy value is the total budget including fee. Sell value is the gross proceeds.
  const quantity = fixedQuantity ?? Math.floor(value / (type === 'buy' ? 1 + FEE_RATE : 1) / price * 1e8) / 1e8
  const notional = round(quantity * price)
  const fee = round(notional * FEE_RATE)
  const debit = round(notional + fee)
  validateTrade(account, type, value, pair, price, exceptId)
  if (quantity <= 0) throw new Error('Quantidade abaixo da precisão disponível.')
  const previous = account.holdings[pair] || { quantity: 0, cost: 0 }
  let balance, holding, realizedPnl = 0
  if (type === 'buy') {
    if (debit > availableCash(account, exceptId) + EPS) throw new Error('Saldo insuficiente para valor e taxa.')
    balance = round(account.balance - debit)
    holding = { quantity: round(previous.quantity + quantity), cost: round(previous.cost + debit) }
  } else {
    if (quantity > availableQuantity(account, pair, exceptId) + EPS) throw new Error('Ativo reservado ou indisponível.')
    const cost = previous.quantity ? previous.cost * quantity / previous.quantity : 0
    balance = round(account.balance + notional - fee)
    realizedPnl = round(notional - fee - cost)
    holding = { quantity: Math.max(0, round(previous.quantity - quantity)), cost: Math.max(0, round(previous.cost - cost)) }
  }
  return { balance, holding, quantity, price, fee, notional, realizedPnl, value: type === 'buy' ? debit : notional }
}
