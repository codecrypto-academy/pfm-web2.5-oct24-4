import { JsonRpcProvider } from "ethers";

export const provider = new JsonRpcProvider(process.env.URL_NODO);
