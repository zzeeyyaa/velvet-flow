import { Hono } from "hono";
import { getListOrder, getDetailOrder, updateStatusOrder } from "../controllers/order.controller";

const orderRouter = new Hono()

orderRouter.get("/", getListOrder)
orderRouter.get("/:id", getDetailOrder)
orderRouter.put("/:id/status", updateStatusOrder)

export default orderRouter;