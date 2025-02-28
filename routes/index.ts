import express from "express";
import authRoutes from "./authRoutes";
import protectedRoutes from "./protectedRoutes";

const router = express.Router();

// 确保路径正确
router.use("/auth", authRoutes);
router.use("/api", protectedRoutes);

export default router;