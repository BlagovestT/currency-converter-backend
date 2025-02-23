import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";
import logger from "../utils/logger";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  logger.error(error.message);

  if (error instanceof AppError)
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
