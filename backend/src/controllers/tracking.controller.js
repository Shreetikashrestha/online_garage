import * as trackingService from '../services/tracking.service.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getTracking = asyncHandler(async (req, res) => {
  const location = await trackingService.getMechanicLocation(req.params.bookingId, req.user.id, req.user.role);

  res.status(200).json({
    status: 'success',
    data: { location },
  });
});
