import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import router from "./routes";
import { config } from "./config/config";
import { errorHandler } from "./middlewares/error.middleware";
import { requestLogger } from "./middlewares/logger.middleware";
import { applyRateLimiting } from "./middlewares/limiter.middleware";
import { fetchAndUpdateCurrencyRates } from "./services/currency.services";
import cron from "node-cron";
import logger from "./utils/logger";
import { connectDatabase, disconnectDatabase } from "./config/database";

dotenv.config();

const PORT = config.port;
const NODE_ENV = config.env;

const app = express();

app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(requestLogger);
app.use(errorHandler);

applyRateLimiting(app);

app.use("/api", router);

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "404: Route Not Found" });
});

// Schedule the job to run every 2 hours
cron.schedule("0 */2 * * *", async () => {
  try {
    logger.info("Running scheduled currency rates update...");
    await fetchAndUpdateCurrencyRates();
    logger.info("Currency rates updated successfully via cron job");
  } catch (error) {
    logger.error("Failed to update currency rates via cron job", { error });
  }
});

(async () => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      logger.info(
        `Server running at http://localhost:${PORT} in ${NODE_ENV} mode`
      );
    });
    process.on("SIGINT", async () => {
      await disconnectDatabase();
    });
    process.on("SIGTERM", async () => {
      await disconnectDatabase();
    });
  } catch (error) {
    logger.error("Server initialization failed", { error });
    process.exit(1);
  }
})();
