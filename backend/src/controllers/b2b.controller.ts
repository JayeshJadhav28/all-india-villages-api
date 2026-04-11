import { Request, Response } from 'express';
import * as b2bService from '../services/b2b.service.js';

// Get dashboard summary
export const getDashboard = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const summary = await b2bService.getDashboardSummary(userId);

    return res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch dashboard',
      },
    });
  }
};

// Get all API keys
export const getApiKeys = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const keys = await b2bService.getUserApiKeys(userId);

    return res.json({
      success: true,
      count: keys.length,
      data: keys,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch API keys',
      },
    });
  }
};

// Create API key
export const createApiKey = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Key name is required',
        },
      });
    }

    const result = await b2bService.createApiKey(userId, name);

    return res.status(201).json({
      success: true,
      data: result,
      warning: 'Store this secret securely. It will not be shown again.',
    });
  } catch (error: any) {
    if (error.message === 'MAX_KEYS_REACHED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MAX_KEYS_REACHED',
          message: 'Maximum 5 API keys allowed',
        },
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create API key',
      },
    });
  }
};

// Revoke API key
export const revokeApiKey = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    await b2bService.revokeApiKey(userId, id);

    return res.json({
      success: true,
      message: 'API key revoked successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to revoke API key',
      },
    });
  }
};

// Get usage stats
export const getUsageStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const days = Math.max(1, Math.min(parseInt(req.query.days as string) || 30, 90));

    const stats = await b2bService.getUsageStats(userId, days);

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch usage stats',
      },
    });
  }
};

// Get profile
export const getProfile = async (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: req.user,
  });
};

// Update profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { businessName, phone, gstNumber } = req.body;

    const user = await b2bService.updateProfile(userId, {
      businessName,
      phone,
      gstNumber,
    });

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update profile',
      },
    });
  }
};