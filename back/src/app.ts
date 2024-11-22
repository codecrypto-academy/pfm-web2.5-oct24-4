import express, { Request, Response } from "express";
import cors from "cors";
import ethers from "ethers";
import bodyParser from "body-parser";
const Docker = require("dockerode");
const app = express();
const docker = new Docker();
const path = require("path");

// Middlewares
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Estructura de datos para almacenar la red y nodos
interface Network {
  networkName: string;
  chainId: string;
  subnet: string;
  ipBootNode: string;
  nodes: Node[];
}

interface Node {
  nodeId: string;
  provider: ethers.JsonRpcProvider; // Proveedor de nodos
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
          "--networkName",
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
        nodes: [],
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

// Función para añadir un nodo a una red Ethereum existente
app.post('/add-node', async (req: Request, res: Response) => {
    const { networkName, nodeId, rpcUrl } = req.body;

    if (!networkName || !nodeId || !rpcUrl) {
        return res.status(400).json({ error: 'networkName, nodeId y rpcUrl son requeridos' });
    }

    try {
        // Crear un proveedor usando el rpcUrl del nodo
        const provider = new ethers.JsonRpcProvider(rpcUrl);

        // Verificar la conexión y obtener la información de la red
        const network = await provider.getNetwork();

        if (network.chainId.toString() !== networkName) {
            return res.status(400).json({ error: 'El networkName no coincide con el RPC proporcionado' });
        }

        // Si la red no existe en el registro, inicializarla
        if (!networks[networkName]) {
            networks[networkName] = { networkName, chainId: '', subnet: '', ipBootNode: '', nodes: [] };
        }

        // Agregar el nodo a la red
        networks[networkName].nodes.push({ nodeId, provider });
        res.json({ message: `Nodo ${nodeId} agregado a la red ${networkName}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al agregar el nodo a la red' });
    }
});

/*
// Ejemplo para obtener detalles de una red y sus nodos
app.get('/network/:networkId', (req: Request, res: Response) => {
  const { networkId } = req.params;

  if (!networks[networkId]) {
      return res.status(404).json({ error: 'Red no encontrada' });
  }

  // Extraer detalles de los nodos de la red solicitada
  const network = networks[networkId];
  const nodeDetails = network.nodes.map((node) => ({
      nodeId: node.nodeId,
      rpcUrl: node.provider.connection.url,
  }));

  res.json({ networkId: network.networkId, nodes: nodeDetails });
});
*/

// Endpoint para obtener detalles de una red
app.get('/network/:networkId', (req: Request, res: Response) => {
  const { networkId } = req.params;

  if (!networks[networkId]) {
      return res.status(404).json({ error: 'Red no encontrada' });
  }

  const network = networks[networkId];
  const nodeDetails = network.nodes.map((node: Node) => ({
      nodeId: node.nodeId,
      rpcUrl: node.provider.connection.url,
  }));

  res.json({ networkId: network.networkId, nodes: nodeDetails });
});

// Endpoint para eliminar un nodo específico de una red Ethereum
app.delete('/remove-node', (req: Request, res: Response) => {
  const { networkId, nodeId } = req.body;

  if (!networkId || !nodeId) {
      return res.status(400).json({ error: 'networkId y nodeId son requeridos' });
  }

  if (!networks[networkId]) {
      return res.status(404).json({ error: 'Red no encontrada' });
  }

  const network = networks[networkId];
  const nodeIndex = network.nodes.findIndex((node) => node.nodeId === nodeId);

  if (nodeIndex === -1) {
      return res.status(404).json({ error: 'Nodo no encontrado en la red especificada' });
  }

  // Eliminar el nodo del array de nodos
  network.nodes.splice(nodeIndex, 1);
  res.json({ message: `Nodo ${nodeId} eliminado de la red ${networkId}` });
});

// Servidor
app.listen(5555, () => {
  console.log("Servidor escuchando en el puerto 5555");
});
