export function createWebSocket(crypto, timeframe, onMessage) {
  const socket = new WebSocket(
    `${import.meta.env.VITE_WS_URL}/${crypto.toLowerCase()}@kline_${timeframe}`
  );

  socket.onopen = () => console.log(`WS conectado: ${crypto}@${timeframe}`);
  socket.onclose = () => console.log(`WS fechado: ${crypto}@${timeframe}`);
  socket.onerror = (err) => console.error("WS erro:", err);

  socket.onmessage = (event) => {
    if (!event.data) return;

    let data;
    try {
      data = JSON.parse(event.data);
    } catch (e) {
      console.error("Falha ao parsear WebSocket:", e);
      return;
    }

    const kline = data.k;
    if (!kline) return;

    onMessage?.(kline); 
  };

  return socket;
}