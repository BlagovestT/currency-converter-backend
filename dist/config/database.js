"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDatabase = exports.connectDatabase = void 0;
const errors_1 = require("../utils/errors");
const logger_1 = __importDefault(require("../utils/logger"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const connectDatabase = async () => {
    try {
        await prisma.$connect();
        logger_1.default.info("Database connected successfully");
    }
    catch (error) {
        logger_1.default.error("Database connection failed", { error });
        throw new errors_1.InternalError("Database connection failed");
    }
};
exports.connectDatabase = connectDatabase;
const disconnectDatabase = async () => {
    try {
        await prisma.$disconnect();
        logger_1.default.info("Database disconnected successfully");
        process.exit(0);
    }
    catch (error) {
        logger_1.default.error("Database disconnection failed", { error });
        process.exit(1);
    }
};
exports.disconnectDatabase = disconnectDatabase;
