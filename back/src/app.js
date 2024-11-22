"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var ethers_1 = require("ethers");
var body_parser_1 = require("body-parser");
var Docker = require("dockerode");
var app = (0, express_1.default)();
var docker = new Docker();
var path = require("path");
// Middlewares
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
// Almacenamiento temporal de redes
var networks = []; // Puedes usar un arreglo para almacenar los nombres de las redes
// Ruta para crear una red
app.post("/create-network", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, networkName, chainId, subnet, ipBootNode, genesisPath, container, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, networkName = _a.networkName, chainId = _a.chainId, subnet = _a.subnet, ipBootNode = _a.ipBootNode;
                // Verificar que todos los campos requeridos estén presentes
                if (!networkName || !chainId || !subnet || !ipBootNode) {
                    return [2 /*return*/, res
                            .status(400)
                            .json({ error: "Todos los campos son obligatorios" })];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 5]);
                genesisPath = path.resolve(__dirname, "network-config", "genesis.json");
                return [4 /*yield*/, docker.createContainer({
                        Image: "ethereum/client-go:v1.11.5",
                        name: "geth-".concat(networkName),
                        Entrypoint: ["/bin/sh", "-c", "geth"], // Usamos /bin/sh para invocar geth desde el contenedor
                        Cmd: [
                            "--http", // Habilitar RPC HTTP
                            "--http.api",
                            "eth,web3,personal,net", // APIs disponibles
                            "--networkName",
                            chainId, // Usamos el chainId proporcionado
                            "--datadir",
                            "/data/".concat(networkName), // Directorio de datos
                            "--mine", // Iniciar minería
                            "--port",
                            "30304", // Configurar el puerto P2P
                            "--bootnodes",
                            ipBootNode, // Usamos la IP del nodo de arranque proporcionado
                        ],
                        HostConfig: {
                            Binds: ["".concat(genesisPath, ":/genesis.json")], // Montar genesis.json en el contenedor
                            PortBindings: {
                                "30304/tcp": [
                                    {
                                        HostPort: "30304", // Asociar el puerto 30304
                                    },
                                ],
                            },
                        },
                    })];
            case 2:
                container = _b.sent();
                // Iniciamos el contenedor
                return [4 /*yield*/, container.start()];
            case 3:
                // Iniciamos el contenedor
                _b.sent();
                // Añadir la red al arreglo de redes
                networks.push({
                    networkName: networkName,
                    chainId: chainId,
                    subnet: subnet,
                    ipBootNode: ipBootNode,
                    nodes: [],
                });
                // Enviar respuesta exitosa
                return [2 /*return*/, res.status(201).json({
                        message: "Red creada exitosamente",
                        networkName: networkName,
                        chainId: chainId,
                        subnet: subnet,
                        ipBootNode: ipBootNode,
                    })];
            case 4:
                error_1 = _b.sent();
                console.error("Error al crear la red:", error_1);
                return [2 /*return*/, res.status(500).json({ error: "Error al crear la red" })];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Ruta para obtener las redes
app.get("/networks", function (req, res) {
    try {
        // Código para obtener la lista de redes creadas
        res.json(networks);
    }
    catch (error) {
        console.error("Error al obtener las redes:", error);
        res.status(500).json({ error: "Error al obtener las redes" });
    }
});
app.get("/network-details/:networkName", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var networkName, network;
    return __generator(this, function (_a) {
        networkName = req.params.networkName;
        network = networks.find(function (net) { return net.networkName === networkName; });
        if (!network) {
            return [2 /*return*/, res.status(404).json({ error: "Red no encontrada" })];
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
        return [2 /*return*/, res.status(200).json(network)];
    });
}); });
app.delete("/delete-network/:networkName", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var networkName, networkIndex, containerName, container, dockerError_1, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                networkName = req.params.networkName;
                networkIndex = networks.findIndex(function (network) { return network.networkName === networkName; });
                if (networkIndex === -1) {
                    return [2 /*return*/, res.status(404).json({ error: "Red no encontrada" })];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 8, , 9]);
                // Aquí eliminamos la red de la lista
                networks.splice(networkIndex, 1);
                containerName = "geth-".concat(networkName);
                return [4 /*yield*/, docker.getContainer(containerName)];
            case 2:
                container = _a.sent();
                _a.label = 3;
            case 3:
                _a.trys.push([3, 6, , 7]);
                return [4 /*yield*/, container.stop()];
            case 4:
                _a.sent(); // Detenemos el contenedor si está en ejecución
                return [4 /*yield*/, container.remove()];
            case 5:
                _a.sent(); // Eliminamos el contenedor
                return [3 /*break*/, 7];
            case 6:
                dockerError_1 = _a.sent();
                console.error("Error al detener o eliminar el contenedor: ".concat(dockerError_1.message));
                return [3 /*break*/, 7];
            case 7: 
            // Enviar respuesta exitosa
            return [2 /*return*/, res
                    .status(200)
                    .json({ message: "Red eliminada exitosamente", networkName: networkName })];
            case 8:
                error_2 = _a.sent();
                console.error("Error al eliminar la red:", error_2);
                return [2 /*return*/, res.status(500).json({ error: "Error al eliminar la red" })];
            case 9: return [2 /*return*/];
        }
    });
}); });
// Función para añadir un nodo a una red Ethereum existente
app.post('/add-node', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, networkName, nodeId, rpcUrl, provider, network, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, networkName = _a.networkName, nodeId = _a.nodeId, rpcUrl = _a.rpcUrl;
                if (!networkName || !nodeId || !rpcUrl) {
                    return [2 /*return*/, res.status(400).json({ error: 'networkName, nodeId y rpcUrl son requeridos' })];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                provider = new ethers_1.default.JsonRpcProvider(rpcUrl);
                return [4 /*yield*/, provider.getNetwork()];
            case 2:
                network = _b.sent();
                if (network.chainId.toString() !== networkName) {
                    return [2 /*return*/, res.status(400).json({ error: 'El networkName no coincide con el RPC proporcionado' })];
                }
                // Si la red no existe en el registro, inicializarla
                if (!networks[networkName]) {
                    networks[networkName] = { networkName: networkName, chainId: '', subnet: '', ipBootNode: '', nodes: [] };
                }
                // Agregar el nodo a la red
                networks[networkName].nodes.push({ nodeId: nodeId, provider: provider });
                res.json({ message: "Nodo ".concat(nodeId, " agregado a la red ").concat(networkName) });
                return [3 /*break*/, 4];
            case 3:
                error_3 = _b.sent();
                console.error(error_3);
                res.status(500).json({ error: 'Error al agregar el nodo a la red' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
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
app.get('/network/:networkId', function (req, res) {
    var networkId = req.params.networkId;
    if (!networks[networkId]) {
        return res.status(404).json({ error: 'Red no encontrada' });
    }
    var network = networks[networkId];
    var nodeDetails = network.nodes.map(function (node) { return ({
        nodeId: node.nodeId,
        rpcUrl: node.provider.connection.url,
    }); });
    res.json({ networkId: network.networkId, nodes: nodeDetails });
});
// Endpoint para eliminar un nodo específico de una red Ethereum
app.delete('/remove-node', function (req, res) {
    var _a = req.body, networkId = _a.networkId, nodeId = _a.nodeId;
    if (!networkId || !nodeId) {
        return res.status(400).json({ error: 'networkId y nodeId son requeridos' });
    }
    if (!networks[networkId]) {
        return res.status(404).json({ error: 'Red no encontrada' });
    }
    var network = networks[networkId];
    var nodeIndex = network.nodes.findIndex(function (node) { return node.nodeId === nodeId; });
    if (nodeIndex === -1) {
        return res.status(404).json({ error: 'Nodo no encontrado en la red especificada' });
    }
    // Eliminar el nodo del array de nodos
    network.nodes.splice(nodeIndex, 1);
    res.json({ message: "Nodo ".concat(nodeId, " eliminado de la red ").concat(networkId) });
});
// Servidor
app.listen(5555, function () {
    console.log("Servidor escuchando en el puerto 5555");
});
