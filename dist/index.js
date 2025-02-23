"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const config_1 = require("./config/config");
const error_middleware_1 = require("./middlewares/error.middleware");
const logger_middleware_1 = require("./middlewares/logger.middleware");
const limiter_middleware_1 = require("./middlewares/limiter.middleware");
const currency_services_1 = require("./services/currency.services");
const node_cron_1 = __importDefault(require("node-cron"));
const logger_1 = __importDefault(require("./utils/logger"));
const database_1 = require("./config/database");
dotenv_1.default.config();
const PORT = config_1.config.port;
const NODE_ENV = config_1.config.env;
const app = (0, express_1.default)();
app.use(express_1.default.json({ limit: "50kb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
app.use(logger_middleware_1.requestLogger);
app.use(error_middleware_1.errorHandler);
(0, limiter_middleware_1.applyRateLimiting)(app);
app.use("/api", routes_1.default);
app.use((req, res) => {
    res.status(404).json({ message: "404: Route Not Found" });
});
// Schedule the job to run every 2 hours
node_cron_1.default.schedule("0 */2 * * *", async () => {
    try {
        logger_1.default.info("Running scheduled currency rates update...");
        await (0, currency_services_1.fetchAndUpdateCurrencyRates)();
        logger_1.default.info("Currency rates updated successfully via cron job");
    }
    catch (error) {
        logger_1.default.error("Failed to update currency rates via cron job", { error });
    }
});
(async () => {
    try {
        await (0, database_1.connectDatabase)();
        app.listen(PORT, () => {
            logger_1.default.info(`Server running at http://localhost:${PORT} in ${NODE_ENV} mode`);
        });
        process.on("SIGINT", async () => {
            await (0, database_1.disconnectDatabase)();
        });
        process.on("SIGTERM", async () => {
            await (0, database_1.disconnectDatabase)();
        });
    }
    catch (error) {
        logger_1.default.error("Server initialization failed", { error });
        process.exit(1);
    }
})();
