import express, { Request, Response } from "express";
import cors from "cors";
import ethers, { JsonRpcProvider } from "ethers";
import fs from "fs";
import bodyParser from "body-parser";
import { exec, execSync } from "child_process";


const Docker = require("dockerode");
const app = express();
const docker = new Docker();
const path = require("path");

//carga las variables de entorno
require("dotenv").config();

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
  provider: JsonRpcProvider; // Proveedor de nodos
}

// Almacenamiento de las redes en networks.json
const networks = JSON.parse(fs.readFileSync('./datos/networks.json').toString())
const DIR_BASE = path.join(__dirname, 'datos')
const DIR_NETWORKS = path.join(DIR_BASE, 'networks')

// Chequear si existe el directorio
function existsDir(dir: fs.PathLike) {
  try {
      fs.statSync(dir)
      return true
  } catch (err) {
      return false
  }
}

// Crear directorio si no existe
function createDir(dir: fs.PathLike) {
  if (!existsDir(dir)) {
      fs.mkdirSync(dir)
  }
}

// Crearcion del Genesis
function createGenesis(network: { id: any; chainId: string; alloc: string[]; }) {
  const pathNetwork = path.join(DIR_NETWORKS, network.id)
  // ejemplo de genesis
  let genesis = {
      "config": {
          "chainId": parseInt(network.chainId),
          "homesteadBlock": 0,
          "eip150Block": 0,
          "eip155Block": 0,
          "eip158Block": 0,
          "byzantiumBlock": 0,
          "constantinopleBlock": 0,
          "petersburgBlock": 0,
          "istanbulBlock": 0,
          "clique": {
              "period": 4,
              "epoch": 30000
          }
      },
      "nonce": "0x0",
      "timestamp": "0x5e9d4d7c",

      "extradata": "0x00000000000000000000000000000000000000000000000000000000000000002235dea2f59600419e3e894d4f2092f0f9c4bb620000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",

      "gasLimit": "0x2fefd8",
      "difficulty": "0x1",

      "alloc": {
          "2235dea2f59600419e3e894d4f2092f0f9c4bb62": {
              "balance": "0xad78ebc5ac6200000"
          },
          "C077193960479a5e769f27B1ce41469C89Bec299": {
              "balance": "0xad78ebc5ac6200000"
          }
      }
  }
  // metemos la cuenta generada 
  network.alloc.push(fs.readFileSync(`${pathNetwork}/address.txt`).toString().trim())
  genesis.alloc = network.alloc.reduce((acc: { [x: string]: { balance: string; }; }, i: string) => {
      const cuenta = i.substring(0, 2) == '0x' ? i.substring(2) : i
      acc[cuenta] = { balance: "0xad78ebc5ac6200000" }
      return acc
  }, {})

  // cuenta que firma
  let cuenta = fs.readFileSync(`${pathNetwork}/address.txt`).toString()
  cuenta = cuenta.substring(0, 2) == '0x' ? cuenta.substring(2) : i

  genesis.extradata = "0x" + "0".repeat(64) + cuenta.trim() + "0".repeat(130)
  return genesis;
}
function createPassword(network: any) {
  return '12345678'
}

//Creacion de nodo Miner
function createNodoMiner(nodo: { name: any; ip: any; }) {
  const miner = `
  ${nodo.name}:
      image: ethereum/client-go:v1.11.5
      volumes:
          - ./${nodo.name}:/root/.ethereum
          - ./genesis.json:/root/genesis.json
          - ./password.txt:/root/.ethereum/password.sec
          - ./keystore:/root/.ethereum/keystore
      depends_on:
          - geth-bootnode
      networks:
          ethnetwork:
              ipv4_address: ${nodo.ip}
      entrypoint: sh -c 'geth init 
          /root/genesis.json && geth   
          --nat "extip:${nodo.ip}"
          --netrestrict=\${SUBNET} 
          --bootnodes="\${BOOTNODE}"
          --miner.etherbase \${ETHERBASE}   
          --mine  
          --unlock \${UNLOCK}
          --password /root/.ethereum/password.sec'

`
  return miner;
}

// Creacion de nodo Boot
function createBootnode(network: any) {
  const bootnode = `
  geth-bootnode:
      hostname: geth-bootnode
      image: ethereum/client-go:alltools-v1.11.5
      command: 'bootnode     --addr \${IPBOOTNODE}:30301 
          --netrestrict=\${SUBNET} 
          --nodekey=/pepe/bootnode.key'
      volumes:
      - ./bootnode.key:/pepe/bootnode.key
      networks:
          ethnetwork:
              ipv4_address: \${IPBOOTNODE} `
  return bootnode;
}

//Creacion de nodo RPC
function createNodoRpc(nodo: { name: any; ip: any; port: any; }) {
  const rpc = `
  ${nodo.name}:
      image: ethereum/client-go:v1.11.5
      volumes:
          - ./${nodo.name}:/root/.ethereum
          - ./genesis.json:/root/genesis.json
      depends_on:
           - geth-bootnode
      networks:
          ethnetwork:
                  ipv4_address: ${nodo.ip}
      ports:
          - "${nodo.port}:8545"
      entrypoint: sh -c 'geth init 
          /root/genesis.json && geth     
          --netrestrict=\${SUBNET}    
          --bootnodes="\${BOOTNODE}"
          --nat "extip:${nodo.ip}"
          --http 
          --http.addr "0.0.0.0" 
          --http.port 8545
          --http.corsdomain "*" 
          --http.api "admin,eth,debug,miner,net,txpool,personal,web3"'
  `
  return rpc
}

//Creacion de nodo Normal
function createNodoNormal(nodo: { name: any; ip: any; }) {
  const n =
      `
  ${nodo.name}:
      image: ethereum/client-go:v1.11.5
      volumes:
          - ./${nodo.name}:/root/.ethereum
          - ./genesis.json:/root/genesis.json
      depends_on:
          - geth-bootnode
      networks:
          ethnetwork:
                  ipv4_address: ${nodo.ip}
      entrypoint: sh -c 'geth init 
          /root/genesis.json && geth   
          --bootnodes="\${BOOTNODE}"
          --nat "extip:${nodo.ip}"
          --netrestrict=\${SUBNET}  ' `
  return n;
}

//Creacion de todos los nodos
function createNodo(nodo: { type?: any; name?: any; ip?: any; port?: any; }) {
  switch (nodo.type) {
      case 'miner':
          return createNodoMiner(nodo)
      case 'rpc':
          return createNodoRpc(nodo)
      case 'normal':
          return createNodoNormal(nodo)
  }
}

//Creacion de docker-compose
function createDockerCompose(network: { nodos: any[]; }) {
  const dockerCompose =
      `
version: '3'
services:
${createBootnode(network)}
${network.nodos.map((nodo: { type?: any; name?: any; ip?: any; port?: any; }) => createNodo(nodo)).join('\n')}
networks:
ethnetwork:
  driver: bridge
  ipam:
    driver: default
    config:
      - subnet: \${SUBNET}

`
  return dockerCompose;
}

//Creacion de archivo de entorno
function createEnv(network: { id: any; ipBootnode: any; subnet: any; }) {
  const pathNetwork = path.join(DIR_NETWORKS, network.id)
  let bootnode =
      `enode://${fs.readFileSync(`${pathNetwork}/bootnode`).toString()}@${network.ipBootnode}:0?discport=30301`
  bootnode = bootnode.replace('\n', '')
  const file =
      `
BOOTNODE=${bootnode}
SUBNET=${network.subnet}
IPBOOTNODE=${network.ipBootnode}
ETHERBASE=${fs.readFileSync(`${pathNetwork}/address.txt`).toString().trim()}
UNLOCK=${fs.readFileSync(`${pathNetwork}/address.txt`).toString().trim()}
`
  return file
}

//Creacion de archivo de password
function createCuentaBootnode(network: any, pathNetwork: any) {

  const cmd = `
  docker run -e IP="@172.16.238.20:0?discport=30301" \
  --rm -v ${pathNetwork}:/root ethereum/client-go:alltools-latest-arm64 \
sh -c "geth account new --password /root/password.txt --datadir /root | grep 'of the key' | cut -c30-  \
> /root/address.txt  \
&&  bootnode -genkey /root/bootnode.key -writeaddress > /root/bootnode"`

  execSync(cmd)

}

//Eliminacion de red de Docker Compose
app.get('/down/:id', async (req, res) => {
  const { id } = req.params
  const pathNetwork = path.join(DIR_NETWORKS, id)
  if (!existsDir(pathNetwork))
      res.status(404).send('No se ha encontrado la red')
  else {
      execSync(`docker-compose -f ${pathNetwork}/docker-compose.yml down`)
      fs.rmdirSync(pathNetwork, { recursive: true })
      res.send({id:id});
  }
})

//Levantar red de Docker Compose
app.get('/up/:id', async (req, res) => {
  const { id } = req.params
  const networks = JSON.parse(fs.readFileSync('./datos/networks.json').toString())

  const network = networks.find(i => i.id == id)
  if (!network)
  res.status(404).send('No se ha encontrado la red')
else {
  
      console.log("up",network)
      const pathNetwork = path.join(DIR_NETWORKS, id)

      if (existsDir(path.join(DIR_BASE, 'networks', id)))
          fs.rmdirSync(path.join(DIR_BASE, 'networks', id), { recursive: true })

      fs.mkdirSync(path.join(DIR_BASE, 'networks', id), { recursive: true })

      fs.writeFileSync(`${pathNetwork}/password.txt`, createPassword(network))

      createCuentaBootnode(network, pathNetwork)
      fs.writeFileSync(`${pathNetwork}/genesis.json`, JSON.stringify(createGenesis(network), null, 4))

      fs.writeFileSync(`${pathNetwork}/docker-compose.yml`, createDockerCompose(network))
      fs.writeFileSync(`${pathNetwork}/.env`, createEnv(network))
      console.log(`docker-compose -f ${pathNetwork}/docker-compose.yml up -d`)
      execSync(`docker-compose -f ${pathNetwork}/docker-compose.yml up -d`)
      
      res.send(network);
  }
})


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
    const networkArray = Object.values(networks); // Convert object to array
    res.json(networkArray);
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
  }
);

app.delete(
  "/delete-network/:networkName",
  async (req: Request, res: Response): Promise<Response> => {
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
app.post("/add-node", async (req: Request, res: Response) => {
  const { networkName, nodeId, rpcUrl } = req.body;

  if (!networkName || !nodeId || !rpcUrl) {
    return res
      .status(400)
      .json({ error: "networkName, nodeId y rpcUrl son requeridos" });
  }

  try {
    // Crear un proveedor usando el rpcUrl del nodo
    const provider = new ethers.JsonRpcProvider(rpcUrl);

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
  } catch (error) {
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
app.get("/network/:networkId", (req: Request, res: Response) => {
  const { networkId } = req.params;

  if (!networks[networkId]) {
    return res.status(404).json({ error: "Red no encontrada" });
  }

  const network = networks[networkId];
  const nodeDetails = network.nodes.map((node: Node) => ({
    nodeId: node.nodeId,
    rpcUrl: node.provider,
  }));

  res.json({ networkId: network.networkName, nodes: nodeDetails });
});

// Endpoint para eliminar un nodo específico de una red Ethereum
app.delete("/remove-node", (req: Request, res: Response) => {
  const { networkId, nodeId } = req.body;

  if (!networkId || !nodeId) {
    return res.status(400).json({ error: "networkId y nodeId son requeridos" });
  }

  if (!networks[networkId]) {
    return res.status(404).json({ error: "Red no encontrada" });
  }

  const network = networks[networkId];
  const nodeIndex = network.nodes.findIndex((node: { nodeId: any; }) => node.nodeId === nodeId);

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
app.get("/network/:networkName/blocks", async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error("Error al obtener los bloques:", error);
    res.status(500).json({ error: "Error al obtener los bloques de la red" });
  }
});

//Faucet
//Faucet - Obtener balance con ethers
app.get("/api/balanceEthers/:address", async (req: Request, res: Response) => {
  const address = req.params.address;
  const provider = new ethers.JsonRpcProvider("process.env.URL_NODO");
  const balance = await provider.getBalance(address);
  res.json({
    address,
    balance: Number(balance) / 10 ** 18,
    fecha: new Date().toISOString(),
  });
});

//Faucet - Obtener balance con Fetch
app.get("/api/balance/:address", async (req: Request, res: Response) => {
  const address = req.params;
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
});

//Faucet - Obtener informacion de cuenta
app.get("/api/faucet/:address/:amount", async (req: Request, res: Response) => {
  const { address, amount } = req.params;
  const provider = new ethers.JsonRpcProvider("process.env.URL_NODO");
  const ruta = process.env.KEYSTORE_FILE as string;
  const rutaData = fs.readFileSync(ruta, "utf-8");
  console.log(rutaData);
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
});

// Servidor
app.listen(5555, () => {
  console.log("Servidor escuchando en el puerto 5555");
});