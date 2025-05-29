import { NextFunction, Request, Response } from "express";
import { ZodError, ZodSchema } from "zod";

export const validateRequest = (schema: ZodSchema<any>) => (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: "Validation error", errors: err.errors });
    } else {
      next(err);
    }
  }
};