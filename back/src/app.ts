import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { config as dotenvConfig } from "dotenv";

import { networkRoutes } from "./routes/networkRoutes";
import { faucetRoutes } from "./routes/faucetRoutes";
import { nodeRoutes } from "./routes/nodeRoutes";

dotenvConfig();

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

app.use("/networks", networkRoutes);
app.use("/faucet", faucetRoutes);
app.use("/nodes", nodeRoutes);

export { app };
