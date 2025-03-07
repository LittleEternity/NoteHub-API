import express, { Request, Response, NextFunction, Router } from "express";
import { methodNotAllowedMiddleware } from "../middlewares/errorHandler";

// 定义路由配置项的接口
export interface RouteConfig {
  path: string;
  methods: string[];
  handler: (req: Request, res: Response, next: NextFunction) => void;
}

// 路由管理器类
export default class RouteManager {
  private router: Router;
  private supportedMethods: { [path: string]: string[] } = {};

  constructor() {
    this.router = express.Router();
  }

  // 添加路由配置
  addRoutes(configs: RouteConfig[]) {
    configs.forEach((config) => {
      this.supportedMethods[config.path] = config.methods;
      config.methods.forEach((method) => {
        const methodLower = method.toLowerCase();
        (this.router as any)[methodLower](config.path, config.handler);
      });
    });
    // 应用不支持方法的中间件
    this.router.use(methodNotAllowedMiddleware(this.supportedMethods));
    return this.router;
  }
}
