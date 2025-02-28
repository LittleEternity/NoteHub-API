import express from "express";
import { login, register, refreshToken } from "../controllers/authController";

const router = express.Router();

// 明确指定请求处理函数的类型
router.post("/login", login as express.RequestHandler);
router.post("/register", register as express.RequestHandler);
router.post("/refresh-token", refreshToken as express.RequestHandler);

export default router;