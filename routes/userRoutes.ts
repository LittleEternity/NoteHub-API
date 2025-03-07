import RouteManager from "../config/routeManager";
import type { RouteConfig } from "../config/routeManager";
import { getUserInfo } from "../controllers/userController";

function createUserRoutes() {
  const routeManager = new RouteManager();
  const routeConfigs: RouteConfig[] = [
    { path: "/info", methods: ["GET"], handler: getUserInfo },
  ];
  return routeManager.addRoutes(routeConfigs);
}
const userRouter = createUserRoutes();
export default userRouter;
