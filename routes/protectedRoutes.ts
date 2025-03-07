import express from "express";
import { verifyToken } from "../middlewares/authMiddleware";
import userRoutes from "./userRoutes";
import noteRoutes from "./noteRoutes";

const router = express.Router();

// 所有路由都需要认证
router.use(verifyToken as express.RequestHandler);

// 用户相关路由
router.use("/user", userRoutes);
// 笔记相关路由
router.use("/note", noteRoutes);

export default router;