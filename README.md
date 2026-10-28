# Crypto Eye

Painel Vue 3 de cotações com candles e volume da Binance. Tema escuro, verde para compra e vermelho para venda. Operações são simulações locais em memória: não existe autenticação, custódia, depósito, execução real nem liquidação de resultados. Recarregar a página limpa as simulações.

## Desenvolvimento

Use Node.js 22.12+ (ou 24 LTS), execute `npm ci` e `npm run dev`. Para validar a entrega: `npm test`, `npm run build` e `npm run preview`. Os testes exercitam ações dos stores de forma isolada; não substituem testes de integração com Vue e o navegador.

As URLs públicas têm valores padrão; `.env.example` documenta as substituições opcionais. Nunca coloque chaves privadas em variáveis `VITE_*`, que são públicas no navegador.

## Arquitetura

- `services/`: HTTP e WebSocket de dados públicos.
- `stores/`: histórico, atualização ao vivo e estado da simulação.
- `components/DefaultGrafBars.vue`: ciclo de vida do gráfico, seleção de mercado e recuperação de falhas.
- `components/trading/`: formulário e operações simuladas.
- `views/Home.vue`: composição responsiva do painel.

O gráfico busca 24 horas de candles de um minuto. Falhas exibem recuperação manual; o histórico permanece visível quando a conexão ao vivo falha. A disponibilidade depende da rede e das restrições regionais da Binance.

## Vercel

Importe o repositório GitHub, selecione Vite e use `npm run build` com saída `dist`. `vercel.json` configura o fallback das rotas. Valide um Preview antes de promover para produção: carregamento de candles, troca BTC/ETH/SOL/BNB, simulação de compra/venda, recuperação de falha e layout móvel. Não é necessário fornecer credenciais da Binance.

## Divisão sugerida para commits

1. `fix/market-data-lifecycle`: serviços, stores de mercado, gráfico e composição de Home.
2. `refactor/trading-dashboard`: validação de valor, identificação da simulação, acessibilidade e layout.
3. `chore/vercel-deployment`: configuração Vercel, documentação e exemplo de ambiente.

Branches, commits, publicação e deploy devem ser feitos somente após validar o build e revisar o diff.
