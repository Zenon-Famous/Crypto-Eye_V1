import { defineStore } from "pinia";
import { createWebSocket } from "@/services/webSocket.service";
import { HistoryCandleService } from "@/services/historyCandles.service";

export const useBinanceStore = defineStore("binanceStore", {
  state: () => ({
    cryptosRealtime: [],
    socket: null,
    currentPair: "",
  }),

  actions: {
    connect(crypto, timeframe) {
      this.currentPair = crypto.toUpperCase();

      if (this.socket && this.socket.readyState === 1) this.socket.close();

      this.socket = createWebSocket(crypto, timeframe, (kline) => {
        const candle = {
          x: new Date(kline.t),
          y: [Number(kline.o), Number(kline.h), Number(kline.l), Number(kline.c)]
        };
        const last = this.cryptosRealtime[this.cryptosRealtime.length - 1];

        if (last && last.x.getTime() === candle.x.getTime()) {
          this.cryptosRealtime[this.cryptosRealtime.length - 1] = candle;
        } else {
          this.cryptosRealtime.push(candle);
        }
      });
    },

    disconnect() {
      if (this.socket) this.socket.close();
      this.socket = null;
    },
  }
});