# Crypto Eye — Corretora simulada

Plataforma Vue 3 de negociação spot com dinheiro fictício e cotações públicas da Binance. Começa com 10.000 USDT demo. Não há custódia, exchange autenticada ou movimentação financeira real.

## Executar e validar

Node.js 22.12+ ou 24 LTS. Execute `npm ci`, `npm test` e `npm run dev`. Valide a versão de produção com `npm run build` e `npm run preview`. Vercel usa Vite e saída `dist`; `vercel.json` mantém as rotas funcionando no acesso direto.

`.env.example` documenta as URLs opcionais da API e WebSocket. Nunca use segredos em variáveis `VITE_*`.

## Negociação

- Compra a mercado: o orçamento em USDT inclui taxa fictícia de 0,1%. O saldo é debitado e a quantidade após taxa é creditada.
- Venda a mercado: informe o valor bruto em USDT. O ativo é debitado e o saldo recebe o valor menos taxa. Vendas sem ativos suficientes são rejeitadas.
- Ordens limitadas: compras reservam USDT; vendas reservam a quantidade. Compra executa quando a cotação fica no limite ou abaixo; venda, no limite ou acima. O cancelamento libera a reserva.
- A simulação usa preços públicos consultados a cada dez segundos e rejeita preços com mais de trinta segundos. Não simula profundidade, slippage, execução parcial ou negociação offline. Enquanto o app está fechado, nenhuma ordem executa retroativamente.
- Quantidades têm precisão de oito casas decimais e são arredondadas para baixo na criação. Saldos e taxas usam oito casas; pode restar uma pequena quantidade abaixo do mínimo negociável de 1 USDT.
- Resultado realizado considera o custo médio incluindo taxas de compra. A carteira mostra custo médio, saldo livre/reservado, patrimônio, variação e taxas. O histórico conserva execuções e cancelamentos. Arquivar um registro recente não vende ativos.
- Depósitos e saques demo alteram somente os valores fictícios; saques não consomem reservas.

## Persistência

A conta, perfil, carteira, ordens e histórico são salvos em localStorage com versão e validação. Cotações não são restauradas: precisam ser consultadas novamente. Dados inválidos ou falha de gravação geram aviso. Use uma única aba para operar. Limpar os dados do navegador apaga a conta; não há autenticação, backup ou sincronização entre dispositivos. A versão anterior de registros sem liquidação não é importada como ativos.

## Organização

`src/domain/broker.js` implementa reservas, validações e liquidação. O store `tradingUi` coordena a conta e persistência. Serviços acessam dados públicos; o template mantém cotações atualizadas entre as páginas. O gráfico usa histórico e WebSocket. Testes cobrem liquidação, taxas, insuficiência de fundos, preço vencido, reservas, execução única, restauração e saques.
