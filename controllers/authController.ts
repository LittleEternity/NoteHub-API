import { Request, Response, NextFunction } from "express";
import User from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ValidationError } from "../types/errors";
import { isValidEmail } from "../utils/utils";
import { createNote } from "./noteController";
const JWT_SECRET = process.env.JWT_SECRET || "";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "";

// 登录
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { account, password } = req.body;
    let queryData = {}; // 查询条件

    // 验证输入
    if (!account || !password) {
      throw new ValidationError("账号和密码不能为空");
    }

    // 判断是否是邮箱，如果是邮箱则查询邮箱，否则查询用户名
    if (isValidEmail(account)) {
      queryData = { email: account };
    } else {
      queryData = { name: account };
    }

    // 查找用户
    const user = await User.findOne(queryData).select("+password");
    if (!user) {
      return res.status(401).json({ message: "用户不存在" });
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "密码错误" });
    }

    // 更新最后登录时间
    user.lastLoginAt = new Date();
    await user.save();

    // 生成 JWT
    const token = jwt.sign({ userId: user.userId }, JWT_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ userId: user.userId }, REFRESH_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      success: true,
      message: "登陆成功",
      data: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        tokenType: "Bearer",
        token,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 注册
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, avatar, gender, desc } = req.body;

    // 1. 验证输入
    if (!name || !email || !password) {
      return res.status(400).json({ message: "请提供完整信息" });
    }

    // 2. 检查邮箱是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "邮箱已被注册" });
    }

    // 3. 创建用户（密码加密由模型处理）
    const newUser = await User.create({
      name,
      email,
      password,
      avatar: avatar || "",
      gender: gender || "",
      desc: desc || "",
    });

    // 4. 创建默认笔记
    await createNote(
      {
        body: {
          creatorId: newUser.userId,
          lastEditorId: newUser.userId,
        },
      } as Request,
      {} as Response,
      next
    );

    // 5. 返回响应
    res.status(201).json({
      success: true,
      message: "注册成功",
      data: {
        userId: newUser.userId,
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// 刷新token
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ message: "未提供刷新令牌" });
    }
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET || "");

    // 添加类型断言和检查
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "userId" in decoded
    ) {
      // 生成新的 access token
      const newAccessToken = jwt.sign(
        { userId: decoded.userId },
        JWT_SECRET as string,
        { expiresIn: "15m" }
      );
      const newRefreshToken = jwt.sign(
        { userId: decoded.userId },
        REFRESH_SECRET,
        { expiresIn: "7d" }
      );
      res.json({
        tokenType: "Bearer",
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } else {
      throw new Error("Invalid token structure");
    }
  } catch (error) {
    next(error); // 将错误传递给错误处理中间件
  }
};
