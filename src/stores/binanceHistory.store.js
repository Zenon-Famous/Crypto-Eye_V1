// store/binanceHistoryStore.ts
import { defineStore } from "pinia";
import { HistoryCandleService } from "@/services/historyCandles.service";

export const useBinanceHistoryStore = defineStore("binanceHistoryStore", {
  state: () => ({
    cryptosHistory: []
  }),

  actions: {
    async getHistory(crypto, timeframe, startTime, endTime) {
      try {
        const allCandles = [];
        let start = startTime;

        while (start < endTime) {
          const res = await HistoryCandleService.getHistoryCandles(
            crypto,
            timeframe,
            start,
            endTime
          );

          if (!res.data.length) break;

          const candles = res.data.map(c => ({
            x: new Date(c[0]),
            y: [Number(c[1]), Number(c[2]), Number(c[3]), Number(c[4])]
          }));

          allCandles.push(...candles);

          start = res.data[res.data.length - 1][0] + 1;
        }

        this.cryptosHistory = allCandles;
      } catch (error) {
        console.error("Erro ao buscar histórico:", error);
        throw error;
      }
    }
  }
});