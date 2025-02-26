import { Request, Response } from "express";
import User from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. 验证输入
    if (!email || !password) {
      return res.status(400).json({ message: "请提供邮箱和密码" });
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

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "服务器错误" });
  }
};