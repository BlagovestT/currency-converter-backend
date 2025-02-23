import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";
import { BadRequestError } from "../utils/errors";

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      next(new BadRequestError("Validation failed"));
    }
  };
};
