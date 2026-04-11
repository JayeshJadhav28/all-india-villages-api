import prisma from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

interface RegisterData {
  email: string;
  businessName: string;
  phone: string;
  gstNumber?: string;
  password: string;
}

export const registerUser = async (data: RegisterData) => {
  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      businessName: data.businessName,
      phone: data.phone,
      gstNumber: data.gstNumber || null,
      passwordHash,
      role: 'CLIENT',
      status: 'PENDING',
      planType: 'FREE',
    },
    select: {
      id: true,
      email: true,
      businessName: true,
      status: true,
    },
  });

  return user;
};

// Distinct error codes so the controller can return meaningful HTTP responses
export type LoginError =
  | 'INVALID_CREDENTIALS'
  | 'PENDING_APPROVAL'
  | 'REJECTED'
  | 'SUSPENDED';

export type LoginResult =
  | { ok: true; token: string; user: object }
  | { ok: false; reason: LoginError };

export const login = async (
  email: string,
  password: string,
): Promise<LoginResult> => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      businessName: true,
      passwordHash: true,
      role: true,
      status: true,
      planType: true,
    },
  });

  if (!user) {
    return { ok: false, reason: 'INVALID_CREDENTIALS' };
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    return { ok: false, reason: 'INVALID_CREDENTIALS' };
  }

  // Block non-active accounts with specific reasons
  if (user.status === 'PENDING') {
    return { ok: false, reason: 'PENDING_APPROVAL' };
  }
  if (user.status === 'REJECTED') {
    return { ok: false, reason: 'REJECTED' };
  }
  if (user.status === 'SUSPENDED') {
    return { ok: false, reason: 'SUSPENDED' };
  }

  // Only ACTIVE users reach here
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const token = jwt.sign(
    { userId: user.id, role: user.role, status: user.status },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn },
  );

  return {
    ok: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      businessName: user.businessName,
      role: user.role,
      status: user.status,
      planType: user.planType,
    },
  };
};