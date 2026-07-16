import { z } from 'zod';
import ApiError from '../utils/apiError.js';

export const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
      return next(new ApiError(400, `Validation Error: ${errorMessage}`));
    }
    next(error);
  }
};
