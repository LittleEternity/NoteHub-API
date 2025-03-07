import { Request, Response, NextFunction } from "express";
import { AppError, MethodNotAllowedError } from "../types/errors";
import { HttpError } from "http-errors";
import express from "express";

export const httpErrorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message,
  });
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // 处理其他未捕获的错误
  res.status(500).json({
    success: false,
    message: "服务器内部错误",
  });
};

// 自定义中间件处理不支持的方法
export const methodNotAllowedMiddleware = (supportedMethods: any) => {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const path = req.path;
    const supported = supportedMethods[path];
    if (supported && !supported.includes(req.method)) {
      next(
        new MethodNotAllowedError(
          `请求方法不被允许！仅支持：${supported.join(",")} 请求`
        )
      );
    } else {
      next();
    }
  };
};
