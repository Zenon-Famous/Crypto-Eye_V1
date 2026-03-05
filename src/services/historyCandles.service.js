import http from "./httpBinance.js";

class HistoryCandleClass {
    async getHistoryCandles(crypto, timeframe, startTime, endTime) {
        return await http.get(
        `/klines?symbol=${crypto.toUpperCase()}&interval=${timeframe}&startTime=${startTime}&endTime=${endTime}&limit=1000`
    );
}
}

export const HistoryCandleService = new HistoryCandleClass();