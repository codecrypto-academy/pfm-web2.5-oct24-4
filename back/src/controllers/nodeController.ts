import { Request, Response } from "express";
import {
  addNodeToNetwork,
  getNodeDetails as getNodeDetailsFromService,
  removeNodeFromNetwork,
} from "../services/nodeService";
import { Node } from "../types/network";

export const addNode = async (req: Request, res: Response) => {
  const { networkName, nodeId, rpcUrl, type, name, ip, port } = req.body;

  try {
    const network = await addNodeToNetwork(
      networkName,
      nodeId,
      rpcUrl,
      type,
      name,
      ip,
      port
    );
    res.json({
      message: `Nodo ${nodeId} agregado a la red ${networkName}`,
      network,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
  }
};

export const getNodeDetails = (req: Request, res: Response) => {
  const { networkId } = req.params;
  try {
    const nodes = getNodeDetailsFromService(networkId);
    res.json({ networkId, nodes });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
  }
};

export const removeNode = (req: Request, res: Response) => {
  const { networkId, nodeId } = req.body;
  try {
    const network = removeNodeFromNetwork(networkId, nodeId);
    res.json({
      message: `Nodo ${nodeId} eliminado de la red ${networkId}`,
      network,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      });
  }
};
