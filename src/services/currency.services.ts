import { Currency, PrismaClient } from "@prisma/client";
import axios from "axios";
import logger from "../utils/logger";
import { InternalError } from "../utils/errors";
import NodeCache from "node-cache";

const prisma = new PrismaClient();
const CURRENCY_API_KEY = process.env.CURRENCY_API_KEY;

const cache = new NodeCache({ stdTTL: 300 }); // Cache data for 5 minutes

export const fetchAndUpdateCurrencyRates = async () => {
  try {
    // Fetch currency rates from the API
    const response = await axios.get(
      `https://v6.exchangerate-api.com/v6/${CURRENCY_API_KEY}/latest/USD`
    );
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
          data: { rate: rate as number },
        });
      } else {
        // Create a new rate
        await prisma.exchangeRate.create({
          data: {
            currency_id: currency.id,
            rate: rate as number,
          },
        });
      }
    }

    logger.info("Currency rates updated successfully");
  } catch (error) {
    console.error("API Error:", error); // Log the API error
    logger.error("Failed to fetch and update currency rates", { error });
    throw new InternalError("Failed to fetch and update currency rates");
  }
};

export const getAllCurrencies = async (
  sortBy: string = "code",
  sortOrder: "asc" | "desc" = "asc"
) => {
  const cacheKey = `currencies-${sortBy}-${sortOrder}`;

  // Check if data is cached
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData as Currency[];
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
      orderBy:
        sortBy === "rate"
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
  } catch (error) {
    logger.error("Failed to fetch currencies", { error });
    throw new InternalError("Failed to fetch currencies");
  }
};

export const convertAll = async (
  from: string,
  amount: number,
  to: string[]
) => {
  const cacheKey = `convert-all-${from}-${amount}-${to.join(",")}`;

  // Check if data is cached
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return cachedData as { [code: string]: number };
  }

  try {
    const results: { [code: string]: number } = {};

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
  } catch (error) {
    logger.error("Batch conversion failed", { error });
    throw new InternalError("Batch conversion failed");
  }
};
