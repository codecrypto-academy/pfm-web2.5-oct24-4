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
  id: string;
  name: string;
}

// Almacenamiento temporal de redes
let networks: Network[] = []; // Puedes usar un arreglo para almacenar los nombres de las redes

// Ruta para crear una red
app.post(
  "/create-network",
  async (req: Request, res: Response): Promise<Response> => {
    const { networkName } = req.body;

    if (!networkName) {
      return res.status(400).json({ error: "Falta el nombre de la red" });
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
          "1234", // ID de red
          "--datadir",
          `/data/${networkName}`, // Directorio de datos
          "--mine", // Iniciar minería
          "--port",
          "30304", // Configurar el puerto P2P
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

      //Añadir la red al arreglo de redes
      networks.push(networkName);

      // Enviar respuesta exitosa
      return res
        .status(201)
        .json({ message: "Red creada exitosamente", networkName });
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

// Servidor
app.listen(5555, () => {
  console.log("Servidor escuchando en el puerto 5555");
});
