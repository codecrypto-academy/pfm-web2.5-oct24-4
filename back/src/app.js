"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const ethers_1 = __importDefault(require("ethers"));
const fs_1 = __importDefault(require("fs"));
const body_parser_1 = __importDefault(require("body-parser"));
const Docker = require("dockerode");
const app = (0, express_1.default)();
const docker = new Docker();
const path = require("path");
//carga las variables de entorno
require("dotenv").config();
// Middlewares
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
// Almacenamiento temporal de redes
const networks = {}; // Puedes usar un arreglo para almacenar los nombres de las redes
// Ruta para crear una red
app.post("/create-network", async (req, res) => {
    const { networkName, chainId, subnet, ipBootNode } = req.body;
    // Verificar que todos los campos requeridos estén presentes
    if (!networkName || !chainId || !subnet || !ipBootNode) {
        return res
            .status(400)
            .json({ error: "Todos los campos son obligatorios" });
    }
    try {
        const genesisPath = path.resolve(__dirname, "network-config", "genesis.json");
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
        networks[networkName] = {
            networkName,
            chainId,
            subnet,
            ipBootNode,
            nodes: [],
        };
        // Enviar respuesta exitosa
        return res.status(201).json({
            message: "Red creada exitosamente",
            networkName,
            chainId,
            subnet,
            ipBootNode,
        });
    }
    catch (error) {
        console.error("Error al crear la red:", error);
        return res.status(500).json({ error: "Error al crear la red" });
    }
});
// Ruta para obtener las redes
app.get("/networks", (req, res) => {
    try {
        // Código para obtener la lista de redes creadas
    const validNetworks = networks.filter(n => n != null); // Filter out null or undefined
    res.json(validNetworks);
    }
    catch (error) {
        console.error("Error al obtener las redes:", error);
        res.status(500).json({ error: "Error al obtener las redes" });
    }
});
app.get("/network-details/:networkName", async (req, res) => {
    const { networkName } = req.params;
    // Buscar la red en la lista de redes (o base de datos)
    const network = networks[networkName];
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
});
app.delete("/delete-network/:networkName", async (req, res) => {
    const { networkName } = req.params;
    // Verificamos si la red existe en el objeto
    if (!networks[networkName]) {
        return res.status(404).json({ error: "Red no encontrada" });
    }
    try {
        // Aquí eliminamos la red del objeto usando 'delete'
        delete networks[networkName];
        // También debemos detener y eliminar el contenedor de Docker asociado (si lo hay)
        const containerName = `geth-${networkName}`;
        const container = await docker.getContainer(containerName);
        try {
            await container.stop(); // Detenemos el contenedor si está en ejecución
            await container.remove(); // Eliminamos el contenedor
        }
        catch (dockerError) {
            console.error(`Error al detener o eliminar el contenedor: ${dockerError.message}`);
        }
        // Enviar respuesta exitosa
        return res
            .status(200)
            .json({ message: "Red eliminada exitosamente", networkName });
    }
    catch (error) {
        console.error("Error al eliminar la red:", error);
        return res.status(500).json({ error: "Error al eliminar la red" });
    }
});
// Función para añadir un nodo a una red Ethereum existente
app.post("/add-node", async (req, res) => {
    const { networkName, nodeId, rpcUrl } = req.body;
    if (!networkName || !nodeId || !rpcUrl) {
        return res
            .status(400)
            .json({ error: "networkName, nodeId y rpcUrl son requeridos" });
    }
    try {
        // Crear un proveedor usando el rpcUrl del nodo
        const provider = new ethers_1.default.JsonRpcProvider(rpcUrl);
        // Verificar la conexión y obtener la información de la red
        const network = await provider.getNetwork();
        if (network.chainId.toString() !== networkName) {
            return res
                .status(400)
                .json({ error: "El networkName no coincide con el RPC proporcionado" });
        }
        // Si la red no existe en el registro, inicializarla
        if (!networks[networkName]) {
            networks[networkName] = {
                networkName,
                chainId: "",
                subnet: "",
                ipBootNode: "",
                nodes: [],
            };
        }
        // Agregar el nodo a la red
        networks[networkName].nodes.push({ nodeId, provider });
        res.json({ message: `Nodo ${nodeId} agregado a la red ${networkName}` });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al agregar el nodo a la red" });
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
app.get("/network/:networkId", (req, res) => {
    const { networkId } = req.params;
    if (!networks[networkId]) {
        return res.status(404).json({ error: "Red no encontrada" });
    }
    const network = networks[networkId];
    const nodeDetails = network.nodes.map((node) => ({
        nodeId: node.nodeId,
        rpcUrl: node.provider,
    }));
    res.json({ networkId: network.networkName, nodes: nodeDetails });
});
// Endpoint para eliminar un nodo específico de una red Ethereum
app.delete("/remove-node", (req, res) => {
    const { networkId, nodeId } = req.body;
    if (!networkId || !nodeId) {
        return res.status(400).json({ error: "networkId y nodeId son requeridos" });
    }
    if (!networks[networkId]) {
        return res.status(404).json({ error: "Red no encontrada" });
    }
    const network = networks[networkId];
    const nodeIndex = network.nodes.findIndex((node) => node.nodeId === nodeId);
    if (nodeIndex === -1) {
        return res
            .status(404)
            .json({ error: "Nodo no encontrado en la red especificada" });
    }
    // Eliminar el nodo del array de nodos
    network.nodes.splice(nodeIndex, 1);
    res.json({ message: `Nodo ${nodeId} eliminado de la red ${networkId}` });
});
// Endpoint para obtener los últimos 10 bloques de una red específica
app.get("/network/:networkName/blocks", async (req, res) => {
    const { networkName } = req.params;
    // Buscar la red en la lista de redes (o base de datos)
    const network = networks[networkName];
    if (!network) {
        return res.status(404).json({ error: "Red no encontrada" });
    }
    // Verificar si hay nodos asociados
    if (network.nodes.length === 0) {
        return res
            .status(404)
            .json({ error: "No hay nodos configurados para esta red" });
    }
    try {
        // Usar el primer nodo como referencia para obtener datos de la red
        const provider = network.nodes[0]?.provider;
        // Obtener el bloque más reciente
        const latestBlockNumber = await provider.getBlockNumber();
        // Obtener los últimos 10 bloques
        const blocks = [];
        for (let i = latestBlockNumber; i > latestBlockNumber - 10 && i >= 0; i--) {
            const block = await provider.getBlock(i);
            if (!block) {
                continue; // Saltar bloques nulos
            }
            blocks.push({
                blockNumber: block.number,
                timestamp: block.timestamp,
                hash: block.hash,
                transactionCount: block.transactions.length,
            });
        }
        res.json(blocks);
    }
    catch (error) {
        console.error("Error al obtener los bloques:", error);
        res.status(500).json({ error: "Error al obtener los bloques de la red" });
    }
});
//Faucet
//Faucet - Obtener balance con ethers
app.get("/api/balanceEthers/:address", async (req, res) => {
    const address = req.params.address;
    const provider = new ethers_1.default.JsonRpcProvider("process.env.URL_NODO");
    const balance = await provider.getBalance(address);
    res.json({
        address,
        balance: Number(balance) / 10 ** 18,
        fecha: new Date().toISOString(),
    });
});
//Faucet - Obtener balance con Fetch
app.get("/api/balance/:address", async (req, res) => {
    const address = req.params;
    const retorno = await fetch(process.env.URL_NODO, {
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
    const data = await retorno.json();
    res.json({
        address,
        balance: Number(data.result) / 10 ** 18,
        fecha: new Date().toISOString(),
    });
});
//Faucet - Obtener informacion de cuenta
app.get("/api/faucet/:address/:amount", async (req, res) => {
    const { address, amount } = req.params;
    const provider = new ethers_1.default.JsonRpcProvider("process.env.URL_NODO");
    const ruta = process.env.KEYSTORE_FILE;
    const rutaData = fs_1.default.readFileSync(ruta, "utf-8");
    console.log(rutaData);
    const wallet = await ethers_1.default.Wallet.fromEncryptedJson(rutaData, process.env.KEYSTORE_PWD);
    const WalletConnected = wallet.connect(provider);
    const tx = await WalletConnected.sendTransaction({
        to: address,
        value: ethers_1.default.parseEther(amount),
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
});
// Servidor
app.listen(5555, () => {
    console.log("Servidor escuchando en el puerto 5555");
});