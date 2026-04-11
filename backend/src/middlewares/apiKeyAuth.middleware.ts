import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db.js';
import bcrypt from 'bcrypt';

// Extend Express Request type to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        status: string;
        planType: string;
      };
      apiKey?: {
        id: string;
        name: string;
      };
    }
  }
}

export const apiKeyAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract API key and secret from headers
    const apiKey = req.headers['x-api-key'] as string;
    const apiSecret = req.headers['x-api-secret'] as string;

    if (!apiKey || !apiSecret) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_API_KEY',
          message: 'API key and secret are required',
        },
      });
    }

    // Find API key in database
    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
            planType: true,
          },
        },
      },
    });

    if (!keyRecord) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_API_KEY',
          message: 'Invalid API key',
        },
      });
    }

    // Check if key is active
    if (keyRecord.status !== 'ACTIVE') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_API_KEY',
          message: 'API key is not active',
        },
      });
    }

    // Check if key is expired
    if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_API_KEY',
          message: 'API key has expired',
        },
      });
    }

    // Verify secret
    const isValidSecret = await bcrypt.compare(apiSecret, keyRecord.secretHash);

    if (!isValidSecret) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_API_KEY',
          message: 'Invalid API secret',
        },
      });
    }

    // Check if user is active
    if (keyRecord.user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'User account is not active',
        },
      });
    }

    // Update last used timestamp (async, don't wait)
    prisma.apiKey
      .update({
        where: { id: keyRecord.id },
        data: { lastUsedAt: new Date() },
      })
      .catch((err) => console.error('Failed to update lastUsedAt:', err));

    // Attach user and key info to request
    req.user = keyRecord.user;
    req.apiKey = {
      id: keyRecord.id,
      name: keyRecord.name,
    };

    return next();
  } catch (error) {
    console.error('API Key Auth Error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Authentication failed',
      },
    });
  }
};