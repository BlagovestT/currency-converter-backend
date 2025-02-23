"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertAllCurrencyHandler = exports.getAllCurrenciesHandler = void 0;
const currency_services_1 = require("../services/currency.services");
const convert_validator_1 = require("../utils/validators/convert.validator");
const logger_1 = __importDefault(require("../utils/logger"));
const getAllCurrenciesHandler = async (req, res, next) => {
    try {
        const { sortBy, sortOrder } = req.query;
        // Validate sortBy and sortOrder
        const validSortFields = ["code", "rate"]; // Fields that can be sorted
        const validSortOrders = ["asc", "desc"]; // Valid sort orders
        const sortField = validSortFields.includes(sortBy)
            ? sortBy
            : "code";
        const sortDirection = validSortOrders.includes(sortOrder)
            ? sortOrder
            : "asc";
        // Fetch currencies with sorting
        const currencies = await (0, currency_services_1.getAllCurrencies)(sortField, sortDirection);
        res.status(200).json(currencies);
    }
    catch (error) {
        logger_1.default.error("Failed to fetch currencies", { error });
        next(error);
    }
};
exports.getAllCurrenciesHandler = getAllCurrenciesHandler;
const convertAllCurrencyHandler = async (req, res, next) => {
    try {
        // Validate the request body
        const { from, amount, to } = convert_validator_1.convertValidator.parse(req.body);
        // Perform the conversion
        const results = await (0, currency_services_1.convertAll)(from, amount, to);
        // Return the results
        res.status(200).json(results);
    }
    catch (error) {
        logger_1.default.error("Batch conversion failed", { error });
        next(error);
    }
};
exports.convertAllCurrencyHandler = convertAllCurrencyHandler;
