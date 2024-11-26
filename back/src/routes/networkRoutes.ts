import { Router } from "express";
import {
  createNetwork,
  getNetworks,
  getNetworkDetails,
  deleteNetwork,
  startNetwork,
  stopNetwork,
} from "../controllers/networkController";

export const networkRoutes = Router();

networkRoutes.post("/create-network", createNetwork);
networkRoutes.get("/", getNetworks);
networkRoutes.get("/:networkName", getNetworkDetails);
networkRoutes.delete("/:networkName", deleteNetwork);
networkRoutes.post("/up/:id", startNetwork);
networkRoutes.post("/down/:id", stopNetwork);
