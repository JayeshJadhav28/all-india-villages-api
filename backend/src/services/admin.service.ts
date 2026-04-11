import { PlanType } from '@prisma/client';
import prisma from '../config/db.js';

// Dashboard metrics
export const getDashboardMetrics = async () => {
  const [
    totalUsers,
    activeUsers,
    pendingUsers,
    totalRequests,
    totalStates,
    totalVillages,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'CLIENT' } }),
    prisma.user.count({ where: { status: 'ACTIVE', role: 'CLIENT' } }),
    prisma.user.count({ where: { status: 'PENDING', role: 'CLIENT' } }),
    prisma.apiLog.count(),
    prisma.state.count(),
    prisma.village.count(),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const requestsToday = await prisma.apiLog.count({
    where: { createdAt: { gte: today } },
  });

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      pending: pendingUsers,
    },
    requests: {
      total: totalRequests,
      today: requestsToday,
    },
    data: {
      states: totalStates,
      villages: totalVillages,
    },
  };
};

// Get all users
export const getAllUsers = async (filters: {
  status?: string;
  plan?: string;
  search?: string;
}) => {
  const where: any = { role: 'CLIENT' };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.plan) {
    where.planType = filters.plan;
  }

  if (filters.search) {
    where.OR = [
      { email: { contains: filters.search, mode: 'insensitive' } },
      { businessName: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return prisma.user.findMany({
    where,
    select: {
      id: true,
      email: true,
      businessName: true,
      phone: true,
      status: true,
      planType: true,
      createdAt: true,
      approvedAt: true,
      lastLoginAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

// Get user detail
export const getUserDetail = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      apiKeys: {
        select: {
          id: true,
          name: true,
          key: true,
          status: true,
          lastUsedAt: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          apiLogs: true,
        },
      },
    },
  });
};

// Approve user
export const approveUser = async (userId: string, adminId: string) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      status: 'ACTIVE',
      approvedAt: new Date(),
      approvedBy: adminId,
    },
  });

  // Log audit
  await prisma.auditLog.create({
    data: {
      actorUserId: adminId,
      action: 'USER_APPROVED',
      entityType: 'User',
      entityId: userId,
      newValue: { status: 'ACTIVE' },
    },
  });

  return user;
};

// Reject user
export const rejectUser = async (userId: string, adminId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { status: 'REJECTED' },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: adminId,
      action: 'USER_REJECTED',
      entityType: 'User',
      entityId: userId,
      newValue: { status: 'REJECTED' },
    },
  });
};

// Suspend user
export const suspendUser = async (userId: string, adminId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { status: 'SUSPENDED' },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: adminId,
      action: 'USER_SUSPENDED',
      entityType: 'User',
      entityId: userId,
      newValue: { status: 'SUSPENDED' },
    },
  });
};

// Change user plan
export const changeUserPlan = async (
  userId: string,
  planType: string,
  adminId: string
) => {
  const plan = planType as PlanType;

  const user = await prisma.user.update({
    where: { id: userId },
    data: { planType: plan },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId: adminId,
      action: 'PLAN_CHANGED',
      entityType: 'User',
      entityId: userId,
      newValue: { planType: plan },
    },
  });

  return user;
};

// Get API logs
export const getApiLogs = async (
  filters: {
    userId?: string;
    endpoint?: string;
    statusCode?: number;
    startDate?: string;
    endDate?: string;
  },
  page: number,
  limit: number
) => {
  const where: any = {};

  if (filters.userId) where.userId = filters.userId;
  if (filters.endpoint) where.endpoint = { contains: filters.endpoint };
  if (filters.statusCode) where.statusCode = filters.statusCode;

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
    if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
  }

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.apiLog.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            businessName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.apiLog.count({ where }),
  ]);

  return {
    data: logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};