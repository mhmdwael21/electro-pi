import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";
import { AppError } from "../utils/AppError";

const formatIssues = (error: ZodError) =>
  error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));

export const validate = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return next(
        new AppError("Validation failed", 400, formatIssues(result.error))
      );
    }

    req.body = result.data;
    next();
  };
};

export const validateParams = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      return next(
        new AppError("Invalid request parameters", 400, formatIssues(result.error))
      );
    }

    next();
  };
};