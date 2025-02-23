"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CurrencyController_1 = require("../controllers/CurrencyController");
const router = express_1.default.Router();
// Fetch all currencies
router.get("/currencies", CurrencyController_1.getAllCurrenciesHandler);
// Convert all currency
router.post("/convert-all", CurrencyController_1.convertAllCurrencyHandler);
exports.default = router;
