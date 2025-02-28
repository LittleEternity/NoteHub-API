import { Request, Response, NextFunction } from "express";
import User from "../models/user";

export const getUserInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 从解码的 token 中获取用户 ID
    if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: "未认证" });
      }
  
      const userId = req.user.userId;

    // 查找用户信息（排除敏感字段）
    const user = await User.findById(userId)
      .select("-password -__v -createdAt -updatedAt");

    if (!user) {
      return res.status(404).json({ message: "用户未找到" });
    }

    res.json({
      success: true,
      data: {
        userId: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error)
  }
};