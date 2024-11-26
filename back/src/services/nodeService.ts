import ethers from "ethers";
import { JsonRpcProvider } from "ethers";
import { Network, Node } from "../types/network";

const networks: { [key: string]: Network } = {};

export const addNodeToNetwork = async (
  networkName: string,
  nodeId: string,
  rpcUrl: string,
  type: "miner" | "rpc" | "normal",
  name: string,
  ip: string,
  port: string
) => {
  const provider = new JsonRpcProvider(rpcUrl);
  const network = await provider.getNetwork();

  if (network.chainId.toString() !== networkName) {
    throw new Error("El networkName no coincide con el RPC proporcionado");
  }

  if (!networks[networkName]) {
    networks[networkName] = {
      id: networkName,
      networkName,
      chainId: "",
      subnet: "",
      ipBootNode: "",
      nodes: [],
    };
  }

  if (!networks[networkName].nodes) {
    networks[networkName].nodes = [];
  }

  networks[networkName].nodes.push({ nodeId, type, name, ip, port, provider });
  return networks[networkName];
};

export const getNodeDetails = (networkId: string) => {
  if (!networks[networkId]) {
    throw new Error("Red no encontrada");
  }

  const network = networks[networkId];
  if (!network.nodes) {
    throw new Error("No hay nodos configurados para esta red");
  }

  return network.nodes.map((node: Node) => ({
    nodeId: node.nodeId,
    type: node.type,
    name: node.name,
    ip: node.ip,
    port: node.port,
    rpcUrl: node.provider,
  }));
};

export const removeNodeFromNetwork = (networkId: string, nodeId: string) => {
  if (!networks[networkId]) {
    throw new Error("Red no encontrada");
  }

  const network = networks[networkId];
  if (!network.nodes) {
    throw new Error("No hay nodos configurados para esta red");
  }

  const nodeIndex = network.nodes.findIndex((node) => node.nodeId === nodeId);

  if (nodeIndex === -1) {
    throw new Error("Nodo no encontrado en la red especificada");
  }

  network.nodes.splice(nodeIndex, 1);
  return network;
};
