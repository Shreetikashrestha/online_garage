import * as userService from '../services/user.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import ApiError from '../utils/apiError.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserProfile(req.user.id);

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateUserProfile(req.user.id, req.body);

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

export const uploadAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ApiError(400, 'Please upload an image file'));
  }

  const result = await uploadToCloudinary(req.file.buffer, 'onlineGarage/avatars', {
    mimetype: req.file.mimetype,
  });

  const user = await userService.updateAvatar(req.user.id, result.secure_url);

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

export const uploadIdentityDoc = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return next(new ApiError(400, 'Please upload a document file'));
  }

  const result = await uploadToCloudinary(req.file.buffer, 'onlineGarage/identity_docs', {
    mimetype: req.file.mimetype,
  });

  const user = await userService.updateIdentityDocument(req.user.id, result.secure_url);

  res.status(200).json({
    status: 'success',
    message: 'Identity document uploaded successfully. Awaiting admin verification.',
    data: { user },
  });
});
