import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodSchema } from 'zod';

declare module 'express' {
  interface Request {
    parsedQuery?: unknown;
  }
}

export type ValidationSchemas = {
  params?: ZodSchema;
  query?: ZodSchema;
  body?: ZodSchema;
};

export type ValidationError = {
  field: string;
  message: string;
};

/**
 * Formats Zod validation errors into a consistent structure
 */
const formatZodErrors = (zodError: ZodError, source: string): ValidationError[] => {
  return zodError.issues.map((issue) => ({
    field: issue.path.length > 0 ? `${source}.${issue.path.join('.')}` : source,
    message: issue.message,
  }));
};

/**
 * Validates request data using Zod schemas
 * @param schemas - Object containing Zod schemas for params, query, and body validation
 * @returns Express middleware function
 */
export const validate =
  (schemas: ValidationSchemas) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const errors: ValidationError[] = [];

    // Validate params
    if (schemas.params) {
      try {
        req.params = schemas.params.parse(req.params) as Request["params"];
      } catch (error) {
        if (error instanceof ZodError) {
          errors.push(...formatZodErrors(error, 'params'));
        }
      }
    }

    // Validate query
    if (schemas.query) {
      try {
        const parsedQuery = schemas.query.parse(req.query);
        // To use default values if not provided then use below else req.query
        req.parsedQuery = parsedQuery;

        // Replace req.query with parsed data
        Object.assign(req.query, parsedQuery);
      } catch (error) {
        if (error instanceof ZodError) {
          errors.push(...formatZodErrors(error, 'query'));
        }
      }
    }

    // Validate body
    if (schemas.body) {
      try {
        req.body = schemas.body.parse(req.body);
      } catch (error) {
        if (error instanceof ZodError) {
          errors.push(...formatZodErrors(error, 'body'));
        }
      }
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors,
      });
      return;
    }

    // All validations passed, continue to next middleware
    next();
  };
