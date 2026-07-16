import * as serviceService from '../services/service.service.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getServices = asyncHandler(async (req, res) => {
  const services = await serviceService.getAllServices();

  res.status(200).json({
    status: 'success',
    results: services.length,
    data: { services },
  });
});

export const getSpareParts = asyncHandler(async (req, res) => {
  const parts = await serviceService.getSpareParts();

  res.status(200).json({
    status: 'success',
    results: parts.length,
    data: { parts },
  });
});

export const getSparePartById = asyncHandler(async (req, res) => {
  const part = await serviceService.getSparePartById(req.params.id);

  if (!part) {
    return res.status(404).json({ status: 'fail', message: 'Spare part not found' });
  }

  res.status(200).json({
    status: 'success',
    data: { part },
  });
});

export const getCompatibleParts = asyncHandler(async (req, res) => {
  const parts = await serviceService.getCompatibleSpareParts(req.params.vehicleId);

  res.status(200).json({
    status: 'success',
    results: parts.length,
    data: { parts },
  });
});

export const placePartsOrder = asyncHandler(async (req, res) => {
  const { cart, vehicleId, scheduledTime } = req.body;

  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ status: 'fail', message: 'Cart must be a non-empty array' });
  }

  const booking = await serviceService.createPartsOrder(req.user.id, {
    cart,
    vehicleId,
    scheduledTime: scheduledTime || new Date().toISOString(),
  });

  res.status(201).json({
    status: 'success',
    data: { booking },
  });
});

export const searchMechanics = asyncHandler(async (req, res) => {
  // Accept both lat/lng (legacy) and latitude/longitude (frontend standard)
  const { lat, lng, latitude, longitude, radius, serviceId } = req.body;

  const mechanics = await serviceService.searchMechanics({
    latitude: latitude ? parseFloat(latitude) : lat ? parseFloat(lat) : null,
    longitude: longitude ? parseFloat(longitude) : lng ? parseFloat(lng) : null,
    radius: radius ? parseFloat(radius) : 50, // wider default radius so mechanics are found
    serviceId,
  });

  res.status(200).json({
    status: 'success',
    results: mechanics.length,
    data: { mechanics },
  });
});
