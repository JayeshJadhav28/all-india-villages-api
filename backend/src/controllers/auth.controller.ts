import { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, businessName, phone, gstNumber, password } = req.body;

    if (!email || !businessName || !phone || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' },
      });
    }

    const user = await authService.registerUser({
      email,
      businessName,
      phone,
      gstNumber,
      password,
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Awaiting admin approval.',
      data: { id: user.id, email: user.email, status: user.status },
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: { code: 'DUPLICATE_ENTRY', message: 'Email already registered' },
      });
    }

    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Registration failed' },
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email and password required' },
      });
    }

    const result = await authService.login(email, password);

    if (!result.ok) {
      // Map each reason to the right HTTP status + message
      const errorMap: Record<
        authService.LoginError,
        { status: number; code: string; message: string }
      > = {
        INVALID_CREDENTIALS: {
          status: 401,
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password',
        },
        PENDING_APPROVAL: {
          status: 403,
          code: 'PENDING_APPROVAL',
          message: 'Your account is awaiting admin approval',
        },
        REJECTED: {
          status: 403,
          code: 'ACCOUNT_REJECTED',
          message: 'Your account registration was rejected',
        },
        SUSPENDED: {
          status: 403,
          code: 'ACCOUNT_SUSPENDED',
          message: 'Your account has been suspended',
        },
      };

      const err = errorMap[result.reason];
      return res.status(err.status).json({
        success: false,
        error: { code: err.code, message: err.message },
      });
    }

    return res.json({
      success: true,
      data: { token: result.token, user: result.user },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Login failed' },
    });
  }
};

export const me = async (req: Request, res: Response) => {
  return res.json({ success: true, data: req.user });
};