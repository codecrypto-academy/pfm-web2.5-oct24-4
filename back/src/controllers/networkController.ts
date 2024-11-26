import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { existsDir, createDir } from "../utils/fileUtils";
import { Network, Node } from "../types/network";
import { docker } from "../config/docker";
import {
  createGenesis,
  createPassword,
  createCuentaBootnode,
  createDockerCompose,
  createEnv,
} from "../services/networkService";

const networks = JSON.parse(
  fs.readFileSync("./datos/networks.json").toString()
);
const DIR_BASE = path.join(__dirname, "datos");
const DIR_NETWORKS = path.join(DIR_BASE, "networks");

export const createNetwork = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { networkName, chainId, subnet, ipBootNode } = req.body;

  if (!networkName || !chainId || !subnet || !ipBootNode) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  try {
    const genesisPath = path.resolve(
      __dirname,
      "network-config",
      "genesis.json"
    );

    const container = await docker.createContainer({
      Image: "ethereum/client-go:v1.11.5",
      name: `geth-${networkName}`,
      Entrypoint: ["/bin/sh", "-c", "geth"],
      Cmd: [
        "--http",
        "--http.api",
        "eth,web3,personal,net",
        "--networkName",
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

    await container.start();

    networks[networkName] = {
      networkName,
      chainId,
      subnet,
      ipBootNode,
      nodes: [],
    };

    return res.status(201).json({
      message: "Red creada exitosamente",
      networkName,
      chainId,
      subnet,
      ipBootNode,
    });
  } catch (error) {
    console.error("Error al crear la red:", error);
    return res.status(500).json({ error: "Error al crear la red" });
  }
};

export const getNetworks = (req: Request, res: Response) => {
  try {
    const networkArray = Object.values(networks);
    res.json(networkArray);
  } catch (error) {
    console.error("Error al obtener las redes:", error);
    res.status(500).json({ error: "Error al obtener las redes" });
  }
};

export const getNetworkDetails = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { networkName } = req.params;

  const network = networks[networkName];

  if (!network) {
    return res.status(404).json({ error: "Red no encontrada" });
  }

  return res.status(200).json(network);
};

export const deleteNetwork = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { networkName } = req.params;

  if (!networks[networkName]) {
    return res.status(404).json({ error: "Red no encontrada" });
  }

  try {
    delete networks[networkName];

    const containerName = `geth-${networkName}`;
    const container = await docker.getContainer(containerName);

    try {
      await container.stop();
      await container.remove();
    } catch (dockerError) {
      console.error(
        `Error al detener o eliminar el contenedor: ${
          (dockerError as Error).message
        }`
      );
    }

    return res
      .status(200)
      .json({ message: "Red eliminada exitosamente", networkName });
  } catch (error) {
    console.error("Error al eliminar la red:", error);
    return res.status(500).json({ error: "Error al eliminar la red" });
  }
};

export const startNetwork = async (req: Request, res: Response) => {
  const { id } = req.params;
  const network = networks.find((i: Network) => i.id == id);

  if (!network) res.status(404).send("No se ha encontrado la red");
  else {
    const pathNetwork = path.join(DIR_NETWORKS, id);

    if (existsDir(path.join(DIR_BASE, "networks", id)))
      fs.rmdirSync(path.join(DIR_BASE, "networks", id), { recursive: true });

    createDir(path.join(DIR_BASE, "networks", id));

    fs.writeFileSync(`${pathNetwork}/password.txt`, createPassword(network));

    createCuentaBootnode(network, pathNetwork);
    fs.writeFileSync(
      `${pathNetwork}/genesis.json`,
      JSON.stringify(createGenesis(network), null, 4)
    );

    fs.writeFileSync(
      `${pathNetwork}/docker-compose.yml`,
      createDockerCompose(network)
    );
    fs.writeFileSync(`${pathNetwork}/.env`, createEnv(network));
    execSync(`docker-compose -f ${pathNetwork}/docker-compose.yml up -d`);

    res.send(network);
  }
};

export const stopNetwork = async (req: Request, res: Response) => {
  const { id } = req.params;
  const pathNetwork = path.join(DIR_NETWORKS, id);
  if (!existsDir(pathNetwork))
    res.status(404).send("No se ha encontrado la red");
  else {
    execSync(`docker-compose -f ${pathNetwork}/docker-compose.yml down`);
    fs.rmdirSync(pathNetwork, { recursive: true });
    res.send({ id: id });
  }
};
