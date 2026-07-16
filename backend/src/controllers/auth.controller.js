import * as authService from '../services/auth.service.js';
import asyncHandler from '../utils/asyncHandler.js';
import env from '../config/env.js';

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000,
};

const refreshCookieOptions = {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = asyncHandler(async (req, res) => {
  const { user, tokens } = await authService.registerUser(req.body);

  // Do not set cookies on registration, only on login
  // res.cookie('accessToken', tokens.accessToken, cookieOptions);
  // res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);

  res.status(201).json({
    status: 'success',
    data: { user, tokens },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  const { user, tokens } = await authService.loginUser(email, password);

  res.cookie('accessToken', tokens.accessToken, cookieOptions);
  res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);

  res.status(200).json({
    status: 'success',
    data: { user, tokens },
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.cookie('accessToken', 'loggedout', {
    ...cookieOptions,
    maxAge: 10 * 1000,
  });
  
  res.cookie('refreshToken', 'loggedout', {
    ...refreshCookieOptions,
    maxAge: 10 * 1000,
  });

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully',
  });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  
  if (!token) {
    return res.status(401).json({
      status: 'fail',
      message: 'Refresh token is required',
    });
  }

  const tokens = await authService.refreshAuthToken(token);

  res.cookie('accessToken', tokens.accessToken, cookieOptions);
  res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);

  res.status(200).json({
    status: 'success',
    data: { tokens },
  });
});
