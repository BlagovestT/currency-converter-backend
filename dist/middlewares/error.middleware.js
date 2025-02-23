"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
const errorHandler = (error, req, res, next) => {
    logger_1.default.error(error.message);
    if (error instanceof errors_1.AppError)
        return res.status(error.statusCode).json({
            status: error.status,
            message: error.message,
        });
    if (error.name === "ZodError")
        return res.status(400).json({
            status: "BAD REQUEST",
            message: error.message,
        });
    return res.status(500).json({
        status: "INTERNAL SERVER ERROR",
        message: error.message,
    });
};
exports.errorHandler = errorHandler;
