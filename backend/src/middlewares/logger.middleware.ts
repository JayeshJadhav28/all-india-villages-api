import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/db.js';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      startTime?: number;
    }
  }
}

function maskIp(ipRaw: string | undefined): string | null {
  if (!ipRaw) return null;

  const ip = ipRaw.startsWith('::ffff:') ? ipRaw.slice(7) : ipRaw;

  // IPv4
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.x.x`;
    return ip;
  }

  // IPv6 (basic masking)
  const parts = ip.split(':').filter(Boolean);
  if (parts.length >= 2) return `${parts[0]}:${parts[1]}:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx`;
  return 'xxxx:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx';
}

// Request ID middleware
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  req.requestId = uuidv4();
  req.startTime = Date.now();
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

// API Logger middleware
export const apiLogger = (req: Request, res: Response, next: NextFunction) => {
  res.on('finish', async () => {
    try {
      // log only for geo API calls (optional, keeps noise low)
      if (!req.originalUrl.startsWith('/api/v1/')) return;

      // only log if apiKeyAuth succeeded (because ApiLog requires userId/apiKeyId)
      if (!req.user || !req.apiKey) return;

      const responseTimeMs = req.startTime ? Date.now() - req.startTime : 0;

      const xff = req.headers['x-forwarded-for'];
      const ipFromXff = Array.isArray(xff) ? xff[0] : (xff as string | undefined);
      const ip = (ipFromXff?.split(',')[0] || req.socket.remoteAddress || '').trim();

      const endpoint = req.originalUrl.split('?')[0];

      await prisma.apiLog.create({
        data: {
          userId: req.user.id,
          apiKeyId: req.apiKey.id,
          endpoint,
          method: req.method,
          statusCode: res.statusCode,
          responseTimeMs,
          ipAddressMasked: maskIp(ip),
          userAgent: (req.headers['user-agent'] as string) || null,
          requestId: req.requestId || 'unknown',
        },
      });
    } catch (err) {
      console.error('Failed to log API request:', err);
    }
  });

  next();
};