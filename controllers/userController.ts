import { Request, Response, NextFunction } from "express";
import User from "../models/user";
import mongoose from "mongoose";

export const getUserInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user && req.user.userId

    if (!userId) {
      return res.status(401).json({ message: "未提供有效的 userId" });
    }

    // 使用 userId 查询
    const user = await User.findOne({ userId }).select(
      "name email avatar gender desc lastLoginAt"
    );

    if (!user) {
      return res.status(404).json({ message: "用户未找到" });
    }

    // 返回完整用户信息
    res.status(200).json({
      success: true,
      data: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        gender: user.gender,
        desc: user.desc,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (error) {
    // 改进错误处理
    if (error instanceof mongoose.Error) {
      return res.status(500).json({ message: "数据库错误" });
    }
    next(error);
  }
};
