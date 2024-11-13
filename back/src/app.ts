import express, { Request, Response } from "express";
import cors from "cors";
const Docker = require("dockerode");
const app = express();
const docker = new Docker();

// Middlewares
app.use(express.json());
app.use(cors());

// Ruta para crear una red
app.post(
  "/create-network",
  async (req: Request, res: Response): Promise<Response> => {
    const { networkName } = req.body;

    if (!networkName) {
      return res.status(400).json({ error: "Falta el nombre de la red" });
    }

    try {
      // Aquí creamos un contenedor con Geth usando Docker
      const container = await docker.createContainer({
        Image: "ethereum/client-go:latest",
        name: `geth-${networkName}`,
        Cmd: [
          "geth",
          "--networkid",
          "1234", // Usamos un ID de red arbitrario (esto podría ser más dinámico)
          "--datadir",
          `/data/${networkName}`,
          "--rpc",
          "--rpcapi",
          "eth,net,web3,personal",
          "--mine",
        ],
        HostConfig: {
          Binds: [`/path/to/genesis.json:/genesis.json`], // Ruta al archivo genesis.json
        },
      });

      // Iniciamos el contenedor
      await container.start();

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

// Servidor
app.listen(5555, () => {
  console.log("Servidor escuchando en el puerto 5555");
});
