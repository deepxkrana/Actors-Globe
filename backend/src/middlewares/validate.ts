import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

export const validate = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues
      });
      return;
    }

    req.body = result.data;
    next();
  };
};

export const validateQuery = (schema: ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues
      });
      return;
    }

    try {
      Object.defineProperty(req, "query", {
        value: result.data,
        writable: true,
        configurable: true,
        enumerable: true
      });
    } catch {
      // Fallback if defineProperty fails
    }
    (req as any).validatedQuery = result.data;
    next();
  };
};