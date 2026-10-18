/**
 * 404 Not Found Middleware
 * This middleware catches any incoming HTTP requests that did not match
 * any defined routes in the application and returns a structured JSON response.
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
  });
};
