import express, { json } from "express";
import cors from "cors";
import { json as _json } from "body-parser";
require("dotenv").config();

import networkRoutes from "./routes/networkRoutes";
import nodeRoutes from "./routes/nodeRoutes";

const app = express();

app.use(json());
app.use(cors());
app.use(_json());

app.use("/networks", networkRoutes);
app.use("/nodes", nodeRoutes);

export { app };
