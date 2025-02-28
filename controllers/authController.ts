import { Request, Response, NextFunction } from "express";
import User from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ValidationError } from "../types/errors";

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // 1. 验证输入
    if (!email || !password) {
        throw new ValidationError("邮箱和密码不能为空");
    }

    // 2. 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "用户不存在" });
    }

    // 3. 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "密码错误" });
    }

    // 4. 生成 JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "1h" }
    );

    res.status(201).json({
        success: true,
        message: "登陆成功",
        data: {
            email,
            name: user.name,
            token,
        }
      });
  } catch (error) {
    next(error); // 将错误传递给错误处理中间件
  }
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;
  
      // 1. 验证输入
      if (!name || !email || !password) {
        return res.status(400).json({ message: "请提供完整信息" });
      }
  
      // 2. 检查邮箱是否已存在
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "邮箱已被注册" });
      }
  
      // 3. 哈希密码
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // 4. 创建用户
      const newUser = await User.create({
        name,
        email,
        password: hashedPassword
      });
  
      // 5. 返回响应（不返回密码）
      res.status(201).json({
        success: true,
        message: "注册成功",
        data: {
          userId: newUser._id,
          name: newUser.name,
          email: newUser.email
        }
      });
    } catch (error) {
        next(error); // 将错误传递给错误处理中间件
    }
  };

  export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const refreshToken = req.body.refreshToken;
        
        if (!refreshToken) {
            return res.status(400).json({ message: "未提供刷新令牌" });
        }
    
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET || "refresh-secret");

      // 添加类型断言和检查
        if (typeof decoded === "object" && decoded !== null && "userId" in decoded) {
            // 生成新的 access token
            const newAccessToken = jwt.sign(
                { userId: decoded.userId },
                process.env.JWT_SECRET || "your-secret-key",
                { expiresIn: "15m" }
            );
            res.json({
                accessToken: newAccessToken
            });
        } else {
            throw new Error("Invalid token structure");
        }
    
    } catch (error) {
        next(error); // 将错误传递给错误处理中间件
    }
  };