import { Request, Response, NextFunction } from "express";
import { getAllCurrencies, convertAll } from "../services/currency.services";
import { convertValidator } from "../utils/validators/convert.validator";
import logger from "../utils/logger";

export const getAllCurrenciesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sortBy, sortOrder } = req.query;

    // Validate sortBy and sortOrder
    const validSortFields = ["code", "rate"]; // Fields that can be sorted
    const validSortOrders = ["asc", "desc"]; // Valid sort orders

    const sortField = validSortFields.includes(sortBy as string)
      ? (sortBy as string)
      : "code";

    const sortDirection = validSortOrders.includes(sortOrder as string)
      ? (sortOrder as "asc" | "desc")
      : "asc";

    // Fetch currencies with sorting
    const currencies = await getAllCurrencies(sortField, sortDirection);
    res.status(200).json(currencies);
  } catch (error) {
    logger.error("Failed to fetch currencies", { error });
    next(error);
  }
};

export const convertAllCurrencyHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate the request body
    const { from, amount, to } = convertValidator.parse(req.body);

    // Perform the conversion
    const results = await convertAll(from, amount, to);

    // Return the results
    res.status(200).json(results);
  } catch (error) {
    logger.error("Batch conversion failed", { error });
    next(error);
  }
};
