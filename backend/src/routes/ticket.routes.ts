import { Hono } from "hono";
import {
    addTicket,
    bookTicket,
    detailTicket,
    listTickets,
} from "../controllers/ticket.controller";

const ticketRouter = new Hono();

ticketRouter.get("/", listTickets);         // GET  /api/v1/tickets
ticketRouter.get("/:id", detailTicket);     // GET  /api/v1/tickets/:id
ticketRouter.post("/", addTicket);          // POST /api/v1/tickets
ticketRouter.post("/book", bookTicket);     // POST /api/v1/tickets/book

export default ticketRouter;
