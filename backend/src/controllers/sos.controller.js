import * as sosService from '../services/sos.service.js';
import asyncHandler from '../utils/asyncHandler.js';

export const triggerAlert = asyncHandler(async (req, res) => {
  const alert = await sosService.triggerSOS(req.user.id, req.body);

  res.status(201).json({
    status: 'success',
    data: { alert },
  });
});

export const respondToAlert = asyncHandler(async (req, res) => {
  const alert = await sosService.respondToSOS(req.params.id, req.user.id);

  res.status(200).json({
    status: 'success',
    data: { alert },
  });
});

export const resolveAlert = asyncHandler(async (req, res) => {
  const alert = await sosService.resolveSOS(req.params.id, req.user.id, req.user.role);

  res.status(200).json({
    status: 'success',
    data: { alert },
  });
});
