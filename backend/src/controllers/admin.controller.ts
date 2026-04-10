import { Request, Response } from 'express';
import * as adminService from '../services/admin.service.js';
import { aggregateUsageDaily as runUsageAggregationDaily } from '../jobs/usageAggregation.job.js';

// Get dashboard metrics
export const getDashboard = async (req: Request, res: Response) => {
  try {
    const metrics = await adminService.getDashboardMetrics();

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch dashboard',
      },
    });
  }
};

// Get all users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const filters = {
      status: req.query.status as string,
      plan: req.query.plan as string,
      search: req.query.search as string,
    };

    const users = await adminService.getAllUsers(filters);

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch users',
      },
    });
  }
};

// Get user detail
export const getUserDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await adminService.getUserDetail(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'User not found',
        },
      });
    }

    return res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch user',
      },
    });
  }
};

// Approve user
export const approveUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.id;

    const user = await adminService.approveUser(id, adminId);

    res.json({
      success: true,
      message: 'User approved successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to approve user',
      },
    });
  }
};

// Reject user
export const rejectUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.id;

    await adminService.rejectUser(id, adminId);

    res.json({
      success: true,
      message: 'User rejected successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to reject user',
      },
    });
  }
};

// Suspend user
export const suspendUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = req.user!.id;

    await adminService.suspendUser(id, adminId);

    res.json({
      success: true,
      message: 'User suspended successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to suspend user',
      },
    });
  }
};

// Change user plan
export const changeUserPlan = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { planType } = req.body;
    const adminId = req.user!.id;

    if (!['FREE', 'PREMIUM', 'PRO', 'UNLIMITED'].includes(planType)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid plan type',
        },
      });
    }

    const user = await adminService.changeUserPlan(id, planType, adminId);

    return res.json({
      success: true,
      message: 'Plan changed successfully',
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to change plan',
      },
    });
  }
};

// Get API logs
export const getApiLogs = async (req: Request, res: Response) => {
  try {
    const filters = {
      userId: req.query.userId as string,
      endpoint: req.query.endpoint as string,
      statusCode: req.query.statusCode ? parseInt(req.query.statusCode as string) : undefined,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };

    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    const result = await adminService.getApiLogs(filters, page, limit);

    res.json({
      success: true,
      count: result.data.length,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch logs',
      },
    });
  }
};

export const aggregateUsageDaily = async (req: Request, res: Response) => {
  try {
    const date = (req.query.date as string) || new Date().toISOString().slice(0, 10);
    const result = await runUsageAggregationDaily(date);
    return res.json({ success: true, data: result });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to aggregate usage' },
    });
  }
};