import { Hono } from "hono";
import { resetSimulation } from "../controllers/simulation.controller";

const simulationRouter = new Hono()

simulationRouter.post('/reset', resetSimulation)

export default simulationRouter;