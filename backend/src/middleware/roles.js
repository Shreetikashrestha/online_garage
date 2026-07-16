import ApiError from '../utils/apiError.js';

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action'));
    }

    next();
  };
};

export const isOwnerOrAdmin = (paramKey = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    if (req.user.role === 'ADMIN') {
      return next();
    }

    if (req.params[paramKey] !== req.user.id) {
      return next(new ApiError(403, 'You are not authorized to access this resource'));
    }

    next();
  };
};
