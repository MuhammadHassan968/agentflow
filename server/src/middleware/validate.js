import { ZodError } from 'zod';

/**
 * Express Middleware factory to validate requests using Zod schemas
 *
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware (req, res, next)
 */
export function validate(schema) {
  return async (req, res, next) => {
    try {
      // Parse req.body, req.query, and req.params against schema
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Assign parsed & sanitized values back to req
      if (parsed.body) req.body = parsed.body;
      if (parsed.query) req.query = parsed.query;
      if (parsed.params) req.params = parsed.params;

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.').replace(/^body\.|^query\.|^params\./, ''),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          error: {
            message: 'Validation failed',
            details: formattedErrors,
          },
        });
      }

      return next(error);
    }
  };
}
