import { InternalError } from "../utils/errors";
import logger from "../utils/logger";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    logger.info("Database connected successfully");
  } catch (error) {
    logger.error("Database connection failed", { error });
    throw new InternalError("Database connection failed");
  }
};

export const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    logger.info("Database disconnected successfully");
    process.exit(0);
  } catch (error) {
    logger.error("Database disconnection failed", { error });
    process.exit(1);
  }
};
