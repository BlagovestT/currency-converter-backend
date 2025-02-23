import express from "express";
import {
  getAllCurrenciesHandler,
  convertAllCurrencyHandler,
} from "../controllers/CurrencyController";

const router = express.Router();

// Fetch all currencies
router.get("/currencies", getAllCurrenciesHandler);

// Convert all currency
router.post("/convert-all", convertAllCurrencyHandler);

export default router;
