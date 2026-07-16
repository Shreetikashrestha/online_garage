import * as vehicleService from '../services/vehicle.service.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getAllVehicles = asyncHandler(async (req, res) => {
  const vehicles = await vehicleService.getUserVehicles(req.user.id);

  res.status(200).json({
    status: 'success',
    results: vehicles.length,
    data: { vehicles },
  });
});

export const getVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.getVehicleById(req.params.id, req.user.id);

  res.status(200).json({
    status: 'success',
    data: { vehicle },
  });
});

export const addVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.addVehicle(req.user.id, req.body);

  res.status(201).json({
    status: 'success',
    data: { vehicle },
  });
});

export const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.updateVehicle(req.params.id, req.user.id, req.body);

  res.status(200).json({
    status: 'success',
    data: { vehicle },
  });
});

export const deleteVehicle = asyncHandler(async (req, res) => {
  await vehicleService.deleteVehicle(req.params.id, req.user.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const setPrimary = asyncHandler(async (req, res) => {
  const vehicle = await vehicleService.setPrimaryVehicle(req.params.id, req.user.id);

  res.status(200).json({
    status: 'success',
    data: { vehicle },
  });
});
