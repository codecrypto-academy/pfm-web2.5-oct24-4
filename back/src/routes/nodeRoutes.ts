import { Router } from "express";
import { createNode, getNodes } from "../controllers/nodeController";

const router = Router();

router.post("/create", createNode);
router.get("/:networkId", getNodes);

export default router;
