import { Hono } from "hono";
import { addCategory, deleteCategory, listCategory } from "../controllers/category.controller";

const categoryRouter = new Hono()

categoryRouter.post("/", addCategory)
categoryRouter.get("/", listCategory)
categoryRouter.delete("/:id", deleteCategory)

export default categoryRouter;