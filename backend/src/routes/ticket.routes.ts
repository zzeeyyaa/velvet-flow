import { Hono } from "hono";
import { bookTicket } from "../controllers/ticket.controller";

const ticketRouter = new Hono();

ticketRouter.post('/book', bookTicket);

export default ticketRouter;
