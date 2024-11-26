import { Request, Response } from "express";
import { provider } from "../config/ethereum";
import fs from "fs";
import ethers from "ethers";

export const getBalanceEthers = async (req: Request, res: Response) => {
  const address = req.params.address;
  const balance = await provider.getBalance(address);
  res.json({
    address,
    balance: Number(balance) / 10 ** 18,
    fecha: new Date().toISOString(),
  });
};

export const getBalance = async (req: Request, res: Response) => {
  const address = req.params.address;
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
  res.json({
    address,
    balance: Number(data.result) / 10 ** 18,
    fecha: new Date().toISOString(),
  });
};

export const getFaucetInfo = async (req: Request, res: Response) => {
  const { address, amount } = req.params;
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
  res.json({
    tx1,
    address,
    amount,
    balance: Number(balance) / 10 ** 18,
    fecha: new Date().toISOString(),
  });
};
