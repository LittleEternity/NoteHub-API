import { Request, Response, NextFunction } from "express";
import { AppError } from "../types/errors";
import { HttpError } from "http-errors";

export const httpErrorHandler = (
    err: HttpError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    res.status(err.status || 500).json({
        success: false,
        message: err.message
    })
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
  }

  // 处理其他未捕获的错误
  res.status(500).json({
    success: false,
    message: "服务器内部错误"
  });
};