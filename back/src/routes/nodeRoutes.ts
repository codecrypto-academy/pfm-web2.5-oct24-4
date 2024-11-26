import { Router } from "express";
import {
  addNode,
  getNodeDetails,
  removeNode,
} from "../controllers/nodeController";

export const nodeRoutes = Router();

nodeRoutes.post("/add", addNode);
nodeRoutes.get("/:networkId", getNodeDetails);
nodeRoutes.delete("/remove", removeNode);
