import { createContainer } from "./dockerService";
import { v4 as uuidv4 } from "uuid";

export const createNode = async (
  networkId: any,
  { type, name, ip, port, accountAddress }: any
) => {
  const nodeId = uuidv4();
  const genesisPath = `/${networkId}.json`;

  // Crear el contenedor de nodo utilizando Docker
  const container = await createContainer({
    Image: "ethereum/client-go:v1.11.5",
    name: `geth-node-${name}`,
    Entrypoint: ["/bin/sh", "-c", "geth"],
    Cmd: [
      "--networkid",
      networkId,
      "--syncmode",
      "full",
      "--datadir",
      `/root/.ethereum`,
      "--http",
      "--http.port",
      port,
      "--http.api",
      "admin,eth,miner,net,txpool,personal,web3",
      "--allow-insecure-unlock",
      "--unlock",
      accountAddress,
      "--password",
      "/root/.ethereum/password.txt",
      "--port",
      port,
      "--bootnodes",
      "enode://<ENODE>",
      "--mine",
      "--miner.etherbase",
      accountAddress,
    ],
    HostConfig: {
      Binds: [
        `/path/to/${name}:/root/.ethereum`,
        `${genesisPath}:/genesis.json`,
      ],
      PortBindings: {
        [`${port}/tcp`]: [{ HostPort: port }],
      },
    },
  });

  return {
    id: nodeId,
    type,
    name,
    ip,
    port,
    accountAddress,
    containerId: container.id,
  };
};
