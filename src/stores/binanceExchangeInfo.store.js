import { defineStore } from "pinia";
import { ExchangeInfoService } from "@/services/exchangeInfo.service";

export const useBinanceExchangeInfoStore = defineStore("binanceExchangeInfoStore", {
  state: () => ({
    exchangeInfo: null
  }),

  actions: {
    async getExchangeInfo() {
      try {
        const res = await ExchangeInfoService.getExchangeInfo();
        this.exchangeInfo = res.data;
      } catch (error) {
        console.error("Erro ao buscar informações da exchange:", error);
        throw error;
      }
    }
  }
});