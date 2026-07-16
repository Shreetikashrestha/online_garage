import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import env from '../config/env.js';
import ApiError from '../utils/apiError.js';
import { exclude } from '../utils/helpers.js';

const signTokens = (user) => {
  const payload = {
    id: user.id,
    role: user.role,
    email: user.email,
  };

  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });

  return { accessToken, refreshToken };
};

export const registerUser = async (data) => {
  const { email: rawEmail, password, name, role, phone } = data;
  const email = rawEmail?.trim().toLowerCase();
  const normalizedPhone = phone?.trim() || null;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(400, 'User with this email already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role,
      phone: normalizedPhone,
    },
  });

  if (role === 'MECHANIC') {
    await prisma.mechanicProfile.create({
      data: {
        userId: newUser.id,
      },
    });
  }

  const tokens = signTokens(newUser);
  const userWithoutPassword = exclude(newUser, ['passwordHash']);

  return { user: userWithoutPassword, tokens };
};

export const loginUser = async (rawEmail, password) => {
  const email = rawEmail?.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(401, 'Incorrect email or password');
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordCorrect) {
    throw new ApiError(401, 'Incorrect email or password');
  }

  const tokens = signTokens(user);
  const userWithoutPassword = exclude(user, ['passwordHash']);

  return { user: userWithoutPassword, tokens };
};

export const refreshAuthToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      throw new ApiError(401, 'The user belonging to this token no longer exists.');
    }

    const tokens = signTokens(user);
    
    return tokens;
  } catch (error) {
    throw new ApiError(401, 'Invalid refresh token. Please log in again.');
  }
};
