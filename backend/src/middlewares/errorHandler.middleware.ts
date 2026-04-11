import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  // Default error
  let statusCode = 500;
  let errorCode = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';

  // Prisma errors
  if (error.code === 'P2002') {
    statusCode = 409;
    errorCode = 'DUPLICATE_ENTRY';
    message = 'Record already exists';
  } else if (error.code === 'P2025') {
    statusCode = 404;
    errorCode = 'NOT_FOUND';
    message = 'Record not found';
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = error.message;
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message: message,
    },
    meta: {
      requestId: req.requestId,
    },
  });
};