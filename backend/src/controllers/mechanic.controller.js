import * as mechanicService from '../services/mechanic.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { getPagination } from '../utils/helpers.js';

export const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await mechanicService.getMechanicProfile(req.user.id);

  res.status(200).json({
    status: 'success',
    data: { profile },
  });
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const profile = await mechanicService.updateMechanicProfile(req.user.id, req.body);

  res.status(200).json({
    status: 'success',
    data: { profile },
  });
});

export const toggleAvailability = asyncHandler(async (req, res) => {
  const profile = await mechanicService.updateAvailability(req.user.id, req.body.isAvailable);

  res.status(200).json({
    status: 'success',
    data: { profile },
  });
});

export const getPublicProfile = asyncHandler(async (req, res) => {
  const profile = await mechanicService.getMechanicProfile(req.params.id);

  res.status(200).json({
    status: 'success',
    data: { profile },
  });
});

export const getReviews = asyncHandler(async (req, res) => {
  const { skip, limit } = getPagination(req.query);
  
  const reviews = await mechanicService.getMechanicReviews(req.params.id, skip, limit);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews },
  });
});
