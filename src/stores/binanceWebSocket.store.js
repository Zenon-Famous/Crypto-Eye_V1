import { defineStore } from "pinia";
import { createWebSocket } from "@/services/webSocket.service";

export const useBinanceStore = defineStore("binanceStore", {
  state: () => ({
    cryptosRealtime: [],
    socket: null,
    currentPair: "",
  }),

  actions: {
    connect(crypto, timeframe) {
      this.currentPair = crypto.toUpperCase();
      this.disconnect();
      this.cryptosRealtime = [];

      const socket = createWebSocket(crypto, timeframe, (kline) => {
        if (this.socket !== socket || kline.s !== this.currentPair) return;
        const candle = {
          x: new Date(kline.t),
          y: [Number(kline.o), Number(kline.h), Number(kline.l), Number(kline.c)],
          volume: Number(kline.v),
        };
        const last = this.cryptosRealtime[this.cryptosRealtime.length - 1];

        if (last && last.x.getTime() === candle.x.getTime()) {
          this.cryptosRealtime[this.cryptosRealtime.length - 1] = candle;
        } else {
          this.cryptosRealtime.push(candle);
          if (this.cryptosRealtime.length > 1000) this.cryptosRealtime.shift();
        }
      });
      this.socket = socket;
    },

    disconnect() {
      if (this.socket) this.socket.close();
      this.socket = null;
    },
  }
});
