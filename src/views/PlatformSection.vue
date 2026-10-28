<template>
  <main class="section-page" :key="route.name">
    <div class="section-heading"><h1>{{ route.meta.title }}</h1><p>Corretora simulada · Conta salva neste navegador</p></div>

    <div v-if="route.name === 'buy'" class="section-grid">
      <form class="section-form" @submit.prevent="buy">
        <h2>Simular uma compra</h2>
        <p>Compre ativos fictícios com seu saldo USDT. O orçamento inclui a taxa demonstrativa de 0,1%.</p>
        <label for="purchase-asset">Criptomoeda</label>
        <select id="purchase-asset" v-model="asset"><option v-for="coin in assets" :key="coin.symbol" :value="coin.symbol">{{ coin.name }} · {{ coin.symbol }}</option></select>
        <label for="purchase-amount">Orçamento total em USDT</label>
        <input id="purchase-amount" v-model.number="amount" type="number" min="1" max="9999" step="0.01" required />
        <dl class="quote-details"><div><dt>Cotação em USDT</dt><dd>{{ price ? money(price) : '—' }}</dd></div><div><dt>Quantidade estimada após taxa</dt><dd>{{ quantity }}</dd></div><div><dt>Atualizada às</dt><dd>{{ quotedAt || '—' }}</dd></div></dl>
        <p v-if="quoteLoading" role="status">Consultando cotação…</p>
        <p v-if="quoteError" role="alert">{{ quoteError }}</p>
        <button type="button" class="secondary-action" :disabled="quoteLoading" @click="fetchQuote">Atualizar cotação</button>
        <button class="primary-action" :disabled="quoteLoading || !price || remaining > 0" type="submit">{{ remaining ? cooldownLabel : 'Registrar compra simulada' }}</button>
        <p v-if="feedback" role="status">{{ feedback }} <RouterLink to="/">Ver operações</RouterLink></p>
      </form>
      <aside class="section-aside"><h2>Como funciona</h2><ol><li>Escolha uma das moedas disponíveis.</li><li>Informe um valor e confira a estimativa.</li><li>Registre a simulação e acompanhe em Trade.</li></ol><p>A estimativa desconta a taxa de 0,1% do orçamento e converte o restante em ativos fictícios. A execução usa a última cotação disponível, com validade de 30 segundos. Não há dinheiro real.</p><RouterLink to="/carteira">Abrir carteira demonstrativa</RouterLink></aside>
    </div>

    <section v-else-if="route.name === 'education'" class="reading-section">
      <h2>Conheça o painel</h2><p>Um guia dos termos e recursos usados nesta demonstração.</p>
      <details v-for="lesson in lessons" :key="lesson.title"><summary>{{ lesson.title }}</summary><p>{{ lesson.body }}</p></details>
      <h2>Pratique na simulação</h2><p>No Trade, selecione o mercado, envie uma compra ou venda e confira o saldo da carteira. Para ordens pendentes, marque “Ordem limitada” e informe o preço. Uma compra executa quando a cotação chega ao limite ou abaixo; uma venda, ao limite ou acima.</p><RouterLink to="/" class="primary-action">Abrir Trade</RouterLink>
    </section>

    <section v-else-if="route.name === 'more'" class="reading-section">
      <h2>Seus recursos</h2><div class="resource-list"><RouterLink v-for="link in resourceLinks" :key="link.to" :to="link.to"><strong>{{ link.title }}</strong><span>{{ link.description }}</span><i class="icon-chevron-right" aria-hidden="true" /></RouterLink></div>
      <h2>Perguntas frequentes</h2><details><summary>As compras e vendas movimentam dinheiro?</summary><p>Não. Todas as operações são registros demonstrativos locais, sem envio de ordens a uma exchange.</p></details><details><summary>O que acontece quando recarrego a página?</summary><p>O saldo, os ativos e as ordens são restaurados do armazenamento deste navegador. As cotações são atualizadas ao reabrir. Limpar os dados do navegador apaga a conta. Não há sincronização com servidor.</p></details><details><summary>Por que o gráfico pode ficar indisponível?</summary><p>As cotações dependem da conexão com a Binance. Use “Tentar novamente” no gráfico para recuperar uma falha de rede.</p></details>
    </section>

    <form v-else-if="route.name === 'profile'" class="section-form narrow" @submit.prevent="saveProfile">
      <h2>Preferências da conta</h2><p>Perfil local da sua conta fictícia, sem autenticação ou sincronização entre dispositivos.</p><label for="display-name">Nome de exibição</label><input id="display-name" v-model="displayName" maxlength="60" required autocomplete="nickname" /><label>Moeda de exibição</label><p>Tether fictício (USDT)</p><button class="primary-action" type="submit">Salvar perfil</button><p v-if="feedback" role="status">{{ feedback }}</p><RouterLink to="/carteira">Gerenciar saldo demonstrativo</RouterLink>
    </form>

    <section v-else-if="route.name === 'notifications'" class="reading-section">
      <div class="section-heading"><h2>Atividade da conta</h2><button class="secondary-action" :disabled="!ui.notifications.some(item => !item.read)" @click="ui.markNotificationsRead()">Marcar todas como lidas</button></div>
      <p v-if="!ui.notifications.length" class="empty-state">Nenhuma notificação. As simulações, alterações no perfil e créditos demo aparecerão aqui.</p>
      <ol v-else class="notification-list"><li v-for="item in ui.notifications" :key="item.id"><div><strong v-if="!item.read">Não lida · </strong>{{ item.message }}</div><time>{{ item.time }}</time></li></ol>
    </section>

    <div v-else-if="route.name === 'wallet'" class="section-grid">
      <form class="section-form" @submit.prevent="addFunds"><h2>Saldo demonstrativo</h2><p class="wallet-balance">{{ money(ui.balance) }}</p><p>Crédito fictício para explorar a plataforma. Não representa dinheiro ou ativos sob custódia.</p><label for="demo-credit">Movimentação fictícia (USDT)</label><input id="demo-credit" v-model.number="credit" type="number" min="1" max="10000" step="0.01" required /><button class="primary-action" type="submit">Depositar saldo demo</button><button class="secondary-action" type="button" @click="withdrawFunds">Sacar saldo demo</button><p v-if="feedback" role="status">{{ feedback }}</p></form>
      <aside class="section-aside"><h2>Resumo da conta</h2><dl class="quote-details"><div><dt>Saldo livre</dt><dd>{{ money(ui.availableBalance) }}</dd></div><div><dt>Saldo reservado</dt><dd>{{ money(ui.reservedBalance) }}</dd></div><div><dt>Patrimônio estimado</dt><dd>{{ ui.portfolioValue === null ? 'Aguardando cotações' : money(ui.portfolioValue) }}</dd></div><div><dt>Resultado realizado</dt><dd>{{ money(ui.realizedPnl) }}</dd></div><div><dt>Variação em carteira</dt><dd>{{ money(ui.unrealizedPnl) }}</dd></div><div><dt>Taxas pagas</dt><dd>{{ money(ui.totalFees) }}</dd></div></dl><h2>Atividade demonstrativa</h2><dl class="quote-details"><div><dt>Registros recentes</dt><dd>{{ ui.operations.length }}</dd></div><div><dt>Ordens pendentes</dt><dd>{{ ui.pendingOrders.length }}</dd></div><div><dt>Registros no histórico</dt><dd>{{ ui.history.length }}</dd></div></dl><p>Compras e vendas alteram este saldo fictício. Ordens limitadas reservam saldo ou ativos e são verificadas a cada atualização, somente enquanto a aplicação está aberta. Não há execução retroativa enquanto o navegador estiver fechado. Use uma única aba para operar esta conta local.</p><RouterLink to="/">Voltar ao Trade</RouterLink></aside>
    </div>
<section v-if="route.name === 'wallet'" class="holdings-section">
      <h2>Seus ativos</h2>
      <p v-if="!Object.values(ui.holdings).some(h => h.quantity > 0)">Você ainda não tem ativos. Use Comprar Cripto ou o Trade para investir seu saldo fictício.</p>
      <div class="holdings-table"><table v-if="Object.values(ui.holdings).some(h => h.quantity > 0)"><thead><tr><th>Ativo</th><th>Quantidade</th><th>Disponível</th><th>Custo médio</th><th>Valor de mercado</th></tr></thead><tbody><tr v-for="[pair, holding] in Object.entries(ui.holdings).filter(([,h]) => h.quantity > 0)" :key="pair"><td>{{ pair }}</td><td>{{ holding.quantity.toFixed(8) }}</td><td>{{ ui.freeQuantity(pair).toFixed(8) }}</td><td>{{ money(holding.cost / holding.quantity) }}</td><td>{{ ui.quotes[pair] ? money(holding.quantity * ui.quotes[pair].price) : 'Aguardando cotação' }}</td></tr></tbody></table></div>
    </section>
  </main>
</template>
<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import http from '@/services/httpBinance'
import { useTradingCooldown } from '@/composables/useTradingCooldown'
import { useTradingUiStore } from '@/stores/tradingUi.store'
const route = useRoute()
const ui = useTradingUiStore()
const { remaining, label: cooldownLabel } = useTradingCooldown()
const asset = ref('BTC')
const amount = ref(100)
const credit = ref(1000)
const displayName = ref(ui.profile.name)
const price = ref(null)
const quotedAt = ref('')
const quoteTimestamp = ref(0)
const quoteLoading = ref(false)
const quoteError = ref('')
const feedback = ref('')
let requestId = 0
let controller
const assets = [{ symbol: 'BTC', name: 'Bitcoin' }, { symbol: 'ETH', name: 'Ethereum' }, { symbol: 'SOL', name: 'Solana' }, { symbol: 'BNB', name: 'BNB' }]
const money = value => Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 4 }) + ' USDT'
const quantity = computed(() => price.value && Number.isFinite(amount.value) && amount.value > 0 ? `${(Math.floor(amount.value / 1.001 / price.value * 1e8) / 1e8).toFixed(8)} ${asset.value}` : '—')
async function fetchQuote() {
  controller?.abort()
  controller = new AbortController()
  const id = ++requestId
  price.value = null
  quotedAt.value = ''
  feedback.value = ''
  quoteLoading.value = true
  quoteError.value = ''
  try {
    const { data } = await http.get('/ticker/price', { params: { symbol: `${asset.value}USDT` }, signal: controller.signal })
    if (id !== requestId) return
    const nextPrice = Number(data.price)
    if (!Number.isFinite(nextPrice) || nextPrice <= 0) throw new Error('Invalid quote')
    ui.updateQuote(`${asset.value}/USDT`, nextPrice)
    price.value = nextPrice
    quoteTimestamp.value = Date.now()
    quotedAt.value = new Date().toLocaleTimeString('pt-BR')
  } catch {
    if (id === requestId) quoteError.value = 'Cotação indisponível. Tente atualizar novamente.'
  } finally { if (id === requestId) quoteLoading.value = false }
}
function buy() {
  if (!price.value || !Number.isFinite(amount.value) || amount.value < 1 || amount.value > 9999) return
  const success = ui.recordOperation('buy', Math.round(amount.value * 100) / 100, `${asset.value}/USDT`)
  feedback.value = success ? 'Compra executada. Ativos creditados na carteira fictícia.' : ui.error
}
function saveProfile() { ui.saveProfile(displayName.value); feedback.value = 'Perfil salvo neste navegador.' }
function withdrawFunds() { feedback.value = ui.withdrawDemoFunds(credit.value) ? 'Saque fictício concluído.' : 'Valor inválido ou saldo livre insuficiente.' }
function addFunds() { feedback.value = ui.addDemoFunds(credit.value) ? 'Saldo fictício atualizado.' : 'Informe um valor entre 1 e 10.000 USDT.' }
watch([() => route.name, asset], () => {
  feedback.value = ''
  if (route.name === 'buy') fetchQuote()
  else { ++requestId; controller?.abort(); quoteLoading.value = false }
}, { immediate: true })
onUnmounted(() => { ++requestId; controller?.abort() })
const resourceLinks = [
  { to: '/carteira', title: 'Carteira demonstrativa', description: 'Consulte o saldo e adicione créditos fictícios.' },
  { to: '/perfil', title: 'Perfil', description: 'Personalize seu perfil local.' },
  { to: '/notificacoes', title: 'Notificações', description: 'Acompanhe os registros de atividade.' },
  { to: '/educacao', title: 'Educação', description: 'Entenda os recursos do painel.' },
]
const lessons = [
  { title: 'Como ler um candle?', body: 'Cada candle resume um intervalo: abertura, máxima, mínima e fechamento. No painel, verde indica fechamento igual ou acima da abertura; vermelho indica fechamento abaixo. O intervalo disponível é de um minuto.' },
  { title: 'O que significa BTC/USDT?', body: 'É o par exibido no gráfico. BTC é o ativo base e USDT é o ativo de cotação: o preço mostra quantas unidades de USDT correspondem a uma unidade de BTC.' },
  { title: 'Volume e atualização ao vivo', body: 'As barras inferiores representam o volume de cada candle. O histórico chega pela API e as atualizações chegam por WebSocket. Uma falha de rede pode interromper a atualização sem apagar o histórico já carregado.' },
  { title: 'Operações, ordens e histórico', body: 'Operações mostra os registros recentes. Compras creditam ativos e vendas os debitam. Ordens limitadas reservam valores e executam ao alcançar o preço escolhido, enquanto o app está aberto. O histórico guarda as execuções, taxas e ordens canceladas. Arquivar um registro não vende ativos; use Vender para isso.' },
]
</script>
<style scoped>
.section-page { flex: 1; min-height: 0; overflow-y: auto; padding: 40px max(24px, calc((100vw - 1120px) / 2)); color: var(--text-color); }
.section-heading { margin-bottom: 32px; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px; }
h1 { font-size: clamp(1.65rem, 3vw, 2.25rem); font-weight: 650; letter-spacing: -0.025em; }
h2 { font-size: 1.15rem; margin-bottom: 18px !important; font-weight: 600; }
p { color: var(--text-muted); line-height: 1.7; margin-bottom: 20px !important; }
.section-heading p { margin: 0 !important; font-size: 0.8rem; }
.section-grid { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 56px; }
.section-form { background: var(--bg-panel); padding: 28px; border-radius: 12px; min-width: 0; }
.narrow { max-width: 620px; }
label { display: block; margin: 18px 0 8px; font-size: 0.85rem; }
input, select { width: 100%; border: 1px solid var(--border-color); border-radius: 6px; background: var(--bg-elevated); color: var(--text-color); padding: 12px; }
.primary-action, .secondary-action { display: inline-block; border-radius: 6px; padding: 12px 16px; font-size: 0.85rem; text-align: center; text-decoration: none; cursor: pointer; margin: 10px 10px 10px 0; }
.primary-action { background: var(--green); color: #001e14; border: 0; font-weight: 600; }
.secondary-action { background: transparent; color: var(--text-color); border: 1px solid var(--border-color); }
a { color: var(--green); text-underline-offset: 4px; }
.section-aside { padding-top: 16px; }
.section-aside ol { color: var(--text-color); padding-left: 20px; line-height: 2; margin-bottom: 24px; }
.quote-details { margin: 24px 0; }
.quote-details div { display: flex; justify-content: space-between; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border-color); font-size: 0.85rem; }
dt { color: var(--text-muted); font-weight: 400; } dd { margin: 0; text-align: right; overflow-wrap: anywhere; }
.reading-section { max-width: 840px; }
.reading-section h2:not(:first-child) { margin-top: 36px !important; }
details { border-bottom: 1px solid var(--border-color); padding: 20px 0; }
summary { cursor: pointer; font-weight: 500; }
details p { padding-top: 16px; max-width: 70ch; }
.resource-list a { display: grid; grid-template-columns: 1fr auto; padding: 22px 0; border-bottom: 1px solid var(--border-color); color: var(--text-color); text-decoration: none; gap: 6px 16px; }
.resource-list span { grid-column: 1; color: var(--text-muted); font-size: 0.85rem; }
.resource-list i { grid-column: 2; grid-row: 1 / 3; align-self: center; }
.notification-list { list-style: none; padding: 0; }
.notification-list li { padding: 20px 0; border-bottom: 1px solid var(--border-color); }
.notification-list time { color: var(--text-muted); display: block; font-size: 0.8rem; margin-top: 8px; }
.wallet-balance { font-size: 2rem; color: var(--text-color); }
@media(max-width:760px) { .section-page { overflow: visible; padding: 28px 16px; } .section-grid { grid-template-columns: 1fr; gap: 24px; } .section-form { padding: 20px; } }
.holdings-section { margin-top: 36px; } .holdings-table { overflow-x: auto; } table { width: 100%; border-collapse: collapse; font-size: 0.85rem; } th, td { text-align: left; padding: 16px 12px; border-bottom: 1px solid var(--border-color); white-space: nowrap; } th { color: var(--text-muted); }
</style>
