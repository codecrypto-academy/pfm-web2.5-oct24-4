import { Request, Response } from "express";
import { createNetwork as _createNetwork } from "../services/networkService";
import { saveNetwork, readNetworks } from "../services/fileService";

export const createNetwork = async (req: Request, res: Response) => {
  console.log("Solicitud POST /networks/create recibida:", req.body);
  const { networkName, chainId, subnet, ipBootNode } = req.body;
  try {
    const network = await _createNetwork(req.body);
    console.log("Red creada:", network);
    saveNetwork(network);
    res.status(201).json(network);
  } catch (error) {
    console.error("Error al crear la red:", error);
    res.status(500).json({ error: "Error al crear la red" });
  }
};

export const getNetworks = (req: Request, res: Response) => {
  console.log("Solicitud GET /networks recibida");
  try {
    const networks = readNetworks();
    res.json(networks);
  } catch (error) {
    console.error("Error al obtener las redes:", error);
    res.status(500).json({ error: "Error al obtener las redes" });
  }
};
