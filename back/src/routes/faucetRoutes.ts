import { Router } from "express";
import {
  getBalanceEthers,
  getBalance,
  getFaucetInfo,
} from "../controllers/faucetController";

export const faucetRoutes = Router();

faucetRoutes.get("/balanceEthers/:address", getBalanceEthers);
faucetRoutes.get("/balance/:address", getBalance);
faucetRoutes.get("/:address/:amount", getFaucetInfo);
