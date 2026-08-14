import http from "./httpBinance.js";

class ExchangeInfoClass {
    async getExchangeInfo() {
        return await http.get('/exchangeInfo')
}
}

export const ExchangeInfoService = new ExchangeInfoClass();