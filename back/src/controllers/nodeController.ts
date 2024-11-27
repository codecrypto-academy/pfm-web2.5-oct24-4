import { Request, Response } from "express";
import { createNode as _createNode } from "../services/nodeService";
import { saveNode, readNodes } from "../services/fileService";

export const createNode = async (req: Request, res: Response) => {
  try {
    const { networkId, ...nodeData } = req.body;
    const node = await _createNode(networkId, nodeData);
    saveNode(networkId, node);
    res.status(201).json(node);
  } catch (error) {
    console.error("Error al crear el nodo:", error);
    res.status(500).json({ error: "Error al crear el nodo" });
  }
};

export const getNodes = (req: Request, res: Response) => {
  try {
    const { networkId } = req.params;
    const nodes = readNodes(networkId);
    res.json(nodes);
  } catch (error) {
    console.error("Error al obtener los nodos:", error);
    res.status(500).json({ error: "Error al obtener los nodos" });
  }
};
