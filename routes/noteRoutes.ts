import RouteManager from "../config/routeManager";
import type { RouteConfig } from "../config/routeManager";
import {
  createNote,
  getNoteList,
  getNoteDetail,
  moveNote,
  updateNote,
  deleteNote,
  searchNotes,
  getNoteTree,
} from "../controllers/noteController";

function createNoteRoutes() {
  const routeManager = new RouteManager();
  const routeConfigs: RouteConfig[] = [
    { path: "/create", methods: ["POST"], handler: createNote },
    { path: "/update", methods: ["POST"], handler: updateNote },
    { path: "/delete", methods: ["POST"], handler: deleteNote },
    { path: "/move", methods: ["POST"], handler: moveNote },
    { path: "/list", methods: ["GET"], handler: getNoteList },
    { path: "/detail", methods: ["GET", "POST"], handler: getNoteDetail },
    { path: "/search", methods: ["GET"], handler: searchNotes },
    { path: "/catalog", methods: ["GET"], handler: getNoteTree },
  ];
  return routeManager.addRoutes(routeConfigs);
}

const noteRouter = createNoteRoutes();
export default noteRouter;
