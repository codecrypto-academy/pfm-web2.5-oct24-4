import express, { Request, Response } from "express";
import cors from "cors";
const Docker = require("dockerode");
const app = express();
const docker = new Docker();
const path = require("path");

// Middlewares
app.use(express.json());
app.use(cors());

interface Network {
  networkName: string;
  chainId: string;
  subnet: string;
  ipBootNode: string;
}

// Almacenamiento temporal de redes
let networks: Network[] = []; // Puedes usar un arreglo para almacenar los nombres de las redes

// Ruta para crear una red
app.post(
  "/create-network",
  async (req: Request, res: Response): Promise<Response> => {
    const { networkName, chainId, subnet, ipBootNode } = req.body;

    // Verificar que todos los campos requeridos estén presentes
    if (!networkName || !chainId || !subnet || !ipBootNode) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios" });
    }

    try {
      const genesisPath = path.resolve(
        __dirname,
        "network-config",
        "genesis.json"
      );

      // Aquí creamos un contenedor con Geth usando Docker
      const container = await docker.createContainer({
        Image: "ethereum/client-go:v1.11.5",
        name: `geth-${networkName}`,
        Entrypoint: ["/bin/sh", "-c", "geth"], // Usamos /bin/sh para invocar geth desde el contenedor
        Cmd: [
          "--http", // Habilitar RPC HTTP
          "--http.api",
          "eth,web3,personal,net", // APIs disponibles
          "--networkid",
          chainId, // Usamos el chainId proporcionado
          "--datadir",
          `/data/${networkName}`, // Directorio de datos
          "--mine", // Iniciar minería
          "--port",
          "30304", // Configurar el puerto P2P
          "--bootnodes",
          ipBootNode, // Usamos la IP del nodo de arranque proporcionado
        ],
        HostConfig: {
          Binds: [`${genesisPath}:/genesis.json`], // Montar genesis.json en el contenedor
          PortBindings: {
            "30304/tcp": [
              {
                HostPort: "30304", // Asociar el puerto 30304
              },
            ],
          },
        },
      });

      // Iniciamos el contenedor
      await container.start();

      // Añadir la red al arreglo de redes
      networks.push({
        networkName: networkName,
        chainId: chainId,
        subnet: subnet,
        ipBootNode: ipBootNode,
      });

      // Enviar respuesta exitosa
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
  }
);

// Ruta para obtener las redes
app.get("/networks", (req, res) => {
  try {
    // Código para obtener la lista de redes creadas
    res.json(networks);
  } catch (error) {
    console.error("Error al obtener las redes:", error);
    res.status(500).json({ error: "Error al obtener las redes" });
  }
});

app.get(
  "/network-details/:networkName",
  async (req: Request, res: Response): Promise<Response> => {
    const { networkName } = req.params;

    // Buscar la red en la lista de redes (o base de datos)
    const network = networks.find((net) => net.networkName === networkName);

    if (!network) {
      return res.status(404).json({ error: "Red no encontrada" });
    }

    /*try {
      // Simulación de detalles de la red (puedes adaptarlo a tu caso real)
      const networkDetails = {
        networkName: network.networkName,
        chainId: network.chainId,
        subnet: network.subnet,
        ipBootNode: network.ipBootNode,
        nodes: [
          {
            id: "node1",
            ip: "192.168.1.2",
            role: "miner",
          },
          {
            id: "node2",
            ip: "192.168.1.3",
            role: "validator",
          },
        ],
      };

      return res.status(200).json(networkDetails);
    } catch (error) {
      console.error("Error al obtener los detalles de la red:", error);
      return res
        .status(500)
        .json({ error: "Error al obtener los detalles de la red" });
    }*/

    // Devolver los detalles de la red
    return res.status(200).json(network);
  }
);

app.delete(
  "/delete-network/:networkName",
  async (req: Request, res: Response): Promise<Response> => {
    const { networkName } = req.params;

    // Buscamos si la red existe
    const networkIndex = networks.findIndex(
      (network) => network.networkName === networkName
    );

    if (networkIndex === -1) {
      return res.status(404).json({ error: "Red no encontrada" });
    }

    try {
      // Aquí eliminamos la red de la lista
      networks.splice(networkIndex, 1);

      // También debemos detener y eliminar el contenedor de Docker asociado (si lo hay)
      const containerName = `geth-${networkName}`;
      const container = await docker.getContainer(containerName);

      try {
        await container.stop(); // Detenemos el contenedor si está en ejecución
        await container.remove(); // Eliminamos el contenedor
      } catch (dockerError) {
        console.error(
          `Error al detener o eliminar el contenedor: ${
            (dockerError as Error).message
          }`
        );
      }

      // Enviar respuesta exitosa
      return res
        .status(200)
        .json({ message: "Red eliminada exitosamente", networkName });
    } catch (error) {
      console.error("Error al eliminar la red:", error);
      return res.status(500).json({ error: "Error al eliminar la red" });
    }
  }
);

// Servidor
app.listen(5555, () => {
  console.log("Servidor escuchando en el puerto 5555");
});
