import { Router } from "express";
import { createNetwork, getNetworks } from "../controllers/networkController";

const router = Router();

router.post("/create", createNetwork);
router.get("/", getNetworks);

export default router;
