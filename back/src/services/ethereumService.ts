import ethers from "ethers";
import { provider } from "../config/ethereum";

export const getBalance = async (address: string) => {
  return await provider.getBalance(address);
};

export const getNetwork = async () => {
  return await provider.getNetwork();
};

export const sendTransaction = async (
  wallet: ethers.Wallet,
  to: string,
  amount: string
) => {
  const tx = await wallet.sendTransaction({
    to,
    value: ethers.parseEther(amount),
  });
  return await tx.wait();
};
