import { createContainer } from "./dockerService";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

interface NetworkParams {
  networkName: string;
  chainId: number;
  subnet: string;
  ipBootNode: string;
}

const createAccount = async (): Promise<string> => {
  const accountContainer = await createContainer({
    Image: "ethereum/client-go:v1.11.5",
    Entrypoint: [
      "/bin/sh",
      "-c",
      "geth account new --password /root/password.txt",
    ],
    HostConfig: {
      Binds: [
        `${process.cwd()}/password.txt:/root/password.txt`,
        `${process.cwd()}/keystore:/root/.ethereum/keystore`,
      ],
    },
  });
  await accountContainer.start();

  await new Promise((resolve) => setTimeout(resolve, 3000));
  const logs = (await accountContainer.logs({ stdout: true })) as Buffer;

  // Intentar detener el contenedor, pero ignorar el error si ya está detenido

  try {
    await accountContainer.stop();
  } catch (error: any) {
    if (error.statusCode !== 304) {
      throw error;
    }
  }

  await accountContainer.remove();
  console.log("Logs del contenedor:", logs.toString());

  const match = logs.toString().match(/(0x[a-fA-F0-9]{40})/);
  if (!match) {
    throw new Error("No se encontró una dirección en los logs");
  }

  const address = match[0]; // Extraer dirección de los logs
  return address;
};

const createGenesis = (
  networkName: string,
  chainId: number,
  allocAddresses: string[]
): string => {
  const genesis = {
    config: {
      chainId: chainId,
      homesteadBlock: 0,
      eip150Block: 0,
      eip155Block: 0,
      eip158Block: 0,
      byzantiumBlock: 0,
      constantinopleBlock: 0,
      petersburgBlock: 0,
      istanbulBlock: 0,
      clique: {
        period: 5,
        epoch: 30000,
      },
    },
    nonce: "0x0",
    timestamp: "0x5e9d4d7c",
    extradata:
      "0x" +
      "0".repeat(64) +
      allocAddresses.join("") +
      "0".repeat(130 - allocAddresses.join("").length),
    gasLimit: "0x2fefd8",
    difficulty: "0x1",
    alloc: allocAddresses.reduce(
      (acc: { [x: string]: { balance: string } }, address: string | number) => {
        acc[address] = { balance: "0xad78ebc5ac6200000" }; // balance inicial
        return acc;
      },
      {}
    ),
  };

  const dataDir = path.join(__dirname, "../data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }

  const genesisPath = path.join(__dirname, `../data/${networkName}.json`);
  fs.writeFileSync(genesisPath, JSON.stringify(genesis, null, 2));
  return genesisPath;
};

export const createNetwork = async ({
  networkName,
  chainId,
  subnet,
  ipBootNode,
}: NetworkParams): Promise<any> => {
  const networkId = uuidv4();

  // Generar cuentas automáticamente
  const allocAddresses: string[] = [];
  for (let i = 0; i < 3; i++) {
    // Generar 3 cuentas como ejemplo
    const address = await createAccount();
    allocAddresses.push(address);
  }

  console.log("Cuentas generadas: ", allocAddresses);
  const genesisPath = createGenesis(networkName, chainId, allocAddresses);
  console.log("Archivo de génesis creado en: ", genesisPath);

  // Crear el contenedor de red utilizando Docker
  console.log("Creando el contenedor de Docker");
  const container = await createContainer({
    Image: "ethereum/client-go:v1.11.5",
    name: `geth-${networkName}`,
    Entrypoint: ["/bin/sh", "-c", "geth"],
    Cmd: [
      "--http",
      "--http.api",
      "eth,web3,personal,net",
      "--networkid",
      chainId,
      "--datadir",
      `/data/${networkName}`,
      "--mine",
      "--port",
      "30304",
      "--bootnodes",
      ipBootNode,
    ],
    HostConfig: {
      Binds: [`${genesisPath}:/genesis.json`],
      PortBindings: {
        "30304/tcp": [{ HostPort: "30304" }],
      },
    },
  });

  console.log("Contenedor creado: ", container.id);

  return {
    id: networkId,
    networkName,
    chainId,
    subnet,
    ipBootNode,
    containerId: container.id,
    nodes: [],
  };
};
