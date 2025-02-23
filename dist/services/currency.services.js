"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertAll = exports.getAllCurrencies = exports.fetchAndUpdateCurrencyRates = void 0;
const client_1 = require("@prisma/client");
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importDefault(require("../utils/logger"));
const errors_1 = require("../utils/errors");
const node_cache_1 = __importDefault(require("node-cache"));
const prisma = new client_1.PrismaClient();
const CURRENCY_API_KEY = process.env.CURRENCY_API_KEY;
const cache = new node_cache_1.default({ stdTTL: 300 }); // Cache data for 5 minutes
const fetchAndUpdateCurrencyRates = async () => {
    try {
        // Fetch currency rates from the API
        const response = await axios_1.default.get(`https://v6.exchangerate-api.com/v6/${CURRENCY_API_KEY}/latest/USD`);
        console.log("API Response:", response.data); // Log the API response
        const rates = response.data.conversion_rates;
        // Update currencies and exchange_rates tables
        for (const [code, rate] of Object.entries(rates)) {
            // Upsert currency
            const currency = await prisma.currency.upsert({
                where: { code },
                update: {},
                create: { code },
            });
            // Check if an exchange rate already exists for this currency
            const existingRate = await prisma.exchangeRate.findFirst({
                where: { currency_id: currency.id },
            });
            // Upsert exchange rate
            if (existingRate) {
                // Update the existing rate
                await prisma.exchangeRate.update({
                    where: { id: existingRate.id },
                    data: { rate: rate },
                });
            }
            else {
                // Create a new rate
                await prisma.exchangeRate.create({
                    data: {
                        currency_id: currency.id,
                        rate: rate,
                    },
                });
            }
        }
        logger_1.default.info("Currency rates updated successfully");
    }
    catch (error) {
        console.error("API Error:", error); // Log the API error
        logger_1.default.error("Failed to fetch and update currency rates", { error });
        throw new errors_1.InternalError("Failed to fetch and update currency rates");
    }
};
exports.fetchAndUpdateCurrencyRates = fetchAndUpdateCurrencyRates;
const getAllCurrencies = async (sortBy = "code", sortOrder = "asc") => {
    const cacheKey = `currencies-${sortBy}-${sortOrder}`;
    // Check if data is cached
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
        return cachedData;
    }
    try {
        const currencies = await prisma.currency.findMany({
            include: {
                exchange_rates: {
                    orderBy: {
                        created_at: "desc",
                    },
                    take: 1,
                },
            },
            orderBy: sortBy === "rate"
                ? {
                    exchange_rates: {
                        _count: sortOrder,
                    },
                }
                : {
                    [sortBy]: sortOrder,
                },
        });
        // Cache the data
        cache.set(cacheKey, currencies);
        return currencies;
    }
    catch (error) {
        logger_1.default.error("Failed to fetch currencies", { error });
        throw new errors_1.InternalError("Failed to fetch currencies");
    }
};
exports.getAllCurrencies = getAllCurrencies;
const convertAll = async (from, amount, to) => {
    const cacheKey = `convert-all-${from}-${amount}-${to.join(",")}`;
    // Check if data is cached
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
        return cachedData;
    }
    try {
        const results = {};
        // Fetch the base currency (e.g., USD)
        const fromCurrency = await prisma.currency.findUnique({
            where: { code: from },
            include: { exchange_rates: { orderBy: { created_at: "desc" }, take: 1 } },
        });
        if (!fromCurrency || !fromCurrency.exchange_rates[0]?.rate) {
            throw new Error("Invalid base currency");
        }
        const fromRate = fromCurrency.exchange_rates[0].rate;
        // Convert to all target currencies
        for (const targetCode of to) {
            const toCurrency = await prisma.currency.findUnique({
                where: { code: targetCode },
                include: {
                    exchange_rates: { orderBy: { created_at: "desc" }, take: 1 },
                },
            });
            if (!toCurrency || !toCurrency.exchange_rates[0]?.rate) {
                results[targetCode] = 0; // Handle missing rates gracefully
                continue;
            }
            const toRate = toCurrency.exchange_rates[0].rate;
            results[targetCode] = (amount / fromRate) * toRate;
        }
        // Cache the results
        cache.set(cacheKey, results);
        return results;
    }
    catch (error) {
        logger_1.default.error("Batch conversion failed", { error });
        throw new errors_1.InternalError("Batch conversion failed");
    }
};
exports.convertAll = convertAll;
