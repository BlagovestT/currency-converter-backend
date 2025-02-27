import rateLimit from "express-rate-limit";
import { Express } from "express";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Don't return the `X-RateLimit-*` headers
});

export const applyRateLimiting = (app: Express) => {
  // Apply the general rate limiter to all routes
  app.use("/api", apiLimiter);
};
