import express from "express";
import { verifyToken } from "../middlewares/authMiddleware";
import { getUserInfo } from "../controllers/userController";

const router = express.Router();

// 所有路由都需要认证
router.use(verifyToken as express.RequestHandler);

// 获取用户信息
router.get("/user", getUserInfo as express.RequestHandler);

// 其他需要认证的路由...

export default router;