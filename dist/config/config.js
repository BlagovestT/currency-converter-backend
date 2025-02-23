"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    env: process.env.NODE_ENV || "development",
    port: process.env.PORT || 3000,
    database: {
        url: process.env.DATABASE_URL,
    },
    currencyApiKey: process.env.CURRENCY_API_KEY,
};
