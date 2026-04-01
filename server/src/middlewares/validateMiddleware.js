// Middleware to validate request data against a Zod schema
export const validate = (schema) => {
  return async (req, res, next) => {
    try {
      const payload = req.body ?? {};
      const validatedData = await schema.parseAsync(payload);
      // Replace req.body with validated  data
      req.body = validatedData;
      next();
    } catch (error) {
      // If the error is a Zod validation error, extract the issues and return them in the response
      if (error.issues) {
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: formattedErrors,
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error during validation",
      });
    }
  };
};

// Middleware to validate route params against a Zod schema
export const validateParams = (schema) => {
  return async (req, res, next) => {
    try {
      const payload = req.params ?? {};
      const validatedParams = await schema.parseAsync(payload);
      req.params = validatedParams;
      next();
    } catch (error) {
      if (error.issues) {
        const formattedErrors = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: formattedErrors,
        });
      }

      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error during validation",
      });
    }
  };
};
