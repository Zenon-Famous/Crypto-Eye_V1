import { defineStore } from "pinia";
import { createWebSocket } from "@/services/webSocket.js";

export const useBinanceStore = defineStore("binanceStore", {
  state: () => ({
    cryptos: [],        // candles no formato ApexCharts
    socket: null,
    currentPair: "",
  }),

  actions: {
    connect(crypto, timeframe) {
      this.currentPair = crypto.toUpperCase();
      this.cryptos = []; // limpa dados antigos

      // fecha socket antigo se existir
      if (this.socket && this.socket.readyState === 1) this.socket.close();

      // cria WebSocket
      this.socket = createWebSocket(crypto, timeframe, (kline) => {
        const candle = {
          x: new Date(kline.t),
          y: [
            Number(kline.o),
            Number(kline.h),
            Number(kline.l),
            Number(kline.c)
          ]
        };

        // atualiza candle existente ou adiciona novo
        const index = this.cryptos.findIndex(c => c.x.getTime() === candle.x.getTime());
        if (index !== -1) {
          this.cryptos[index] = candle; // atualiza candle aberto
        } else {
          this.cryptos.push(candle);
        }
      });
    },

    disconnect() {
      if (this.socket) this.socket.close();
      this.socket = null;
    },

    changePair(newPair, timeframe) {
      this.connect(newPair, timeframe);
    }
  }
});