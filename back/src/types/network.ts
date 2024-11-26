import { JsonRpcProvider } from "ethers";

export interface Network {
  id: string;
  networkName: string;
  chainId: string;
  subnet: string;
  ipBootNode: string;
  nodes?: Node[];
  alloc?: string[];
}

export interface Node {
  nodeId: string;
  type: "miner" | "rpc" | "normal";
  name: string;
  ip: string;
  port: string;
  provider: JsonRpcProvider;
}
