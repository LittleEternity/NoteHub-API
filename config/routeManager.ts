import express, { Request, Response, NextFunction, Router } from "express";
import { methodNotAllowedMiddleware } from "../middlewares/errorHandler";

// 定义路由配置项的接口，使用更精确的类型
export interface RouteConfig {
  path: string;
  methods: Array<"GET" | "POST" | "PUT" | "DELETE" | "PATCH">;
  handler: Function;
}

// 路由管理器类
export default class RouteManager {
  private router: Router;
  private supportedMethods: Record<
    string,
    Array<"GET" | "POST" | "PUT" | "DELETE" | "PATCH">
  > = {};

  constructor() {
    this.router = express.Router();
  }

  // 添加路由配置
  addRoutes(configs: RouteConfig[]): Router {
    configs.forEach((config) => {
      this.supportedMethods[config.path] = config.methods;
      config.methods.forEach((method) => {
        const methodLower = method.toLowerCase();
        (this.router as any)[methodLower](
          config.path,
          async (req: Request, res: Response, next: NextFunction) => {
            try {
              await config.handler(req, res, next);
            } catch (error) {
              next(error);
            }
          }
        );
      });
    });
    // 应用不支持方法的中间件
    this.router.use(methodNotAllowedMiddleware(this.supportedMethods));
    return this.router;
  }
}
