import { JsonRpcProvider } from "ethers";

const provider = new JsonRpcProvider(process.env.URL_NODO);

export default provider;
