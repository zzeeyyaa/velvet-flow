import { Hono } from "hono";
import { addEvent, deleteEventById, detailEvent, listEvent, updateEventbyId } from "../controllers/event.controller";

const eventRouter = new Hono();

eventRouter.post("/", addEvent);
eventRouter.get("/", listEvent);
eventRouter.get("/:id", detailEvent);
eventRouter.put("/:id", updateEventbyId);
eventRouter.delete("/:id", deleteEventById);

export default eventRouter;