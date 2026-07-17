import { Hono } from "hono";
import { getMetricLive } from "../controllers/metric.controller";

const metricRouter = new Hono();

metricRouter.get("/live", getMetricLive);

export default metricRouter;