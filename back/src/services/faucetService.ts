import { provider } from "../config/ethereum";
import ethers from "ethers";
import fs from "fs";

export const getBalanceEthers = async (address: string) => {
  const balance = await provider.getBalance(address);
  return Number(balance) / 10 ** 18;
};

export const getBalance = async (address: string) => {
  const retorno = await fetch(process.env.URL_NODO as string, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_getBalance",
      params: [address, "latest"],
      id: 1,
    }),
  });
  const data: any = await retorno.json();
  return Number(data.result) / 10 ** 18;
};

export const getFaucetInfo = async (address: string, amount: string) => {
  const ruta = process.env.KEYSTORE_FILE as string;
  const rutaData = fs.readFileSync(ruta, "utf-8");
  const wallet = await ethers.Wallet.fromEncryptedJson(
    rutaData,
    process.env.KEYSTORE_PWD as string
  );
  const WalletConnected = wallet.connect(provider);
  const tx = await WalletConnected.sendTransaction({
    to: address,
    value: ethers.parseEther(amount),
  });
  const tx1 = await tx.wait();
  const balance = await provider.getBalance(address);
  return {
    tx1,
    address,
    amount,
    balance: Number(balance) / 10 ** 18,
    fecha: new Date().toISOString(),
  };
};
