import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError, UnauthorizedError } from "../types/errors";

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
};

// 验证 token
export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];
  try {
    if (!token) {
      throw new UnauthorizedError("未提供认证令牌");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "userId" in decoded
    ) {
      req.user = decoded as { userId: string };
      return next();
    }

    throw new UnauthorizedError("无效的 token 结构");
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        code: 401,
        success: false,
        message: error.message,
      });
    } else {
      res.status(401).json({
        code: 401,
        success: false,
        message: "令牌认证不通过",
      });
    }
  }
};
