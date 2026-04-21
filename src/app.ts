import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./app/routes";
import { env } from "./config/env";

const app = express();

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use(routes);

export default app;