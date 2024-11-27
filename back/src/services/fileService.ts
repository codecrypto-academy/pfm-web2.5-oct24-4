import fs from "fs";
import path from "path";

const dataDir =
  process.env.NODE_ENV === "production"
    ? path.join(__dirname, "../data")
    : path.join(process.cwd(), "data");
const networksFilePath = path.join(dataDir, "networks.json");

//  Crear el archivo y directorio si no existen
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true }); // Crear directorio
  console.log("Directorio 'data' creado:", dataDir); // Log para confirmar creación del directorio
}

if (!fs.existsSync(networksFilePath)) {
  fs.writeFileSync(networksFilePath, JSON.stringify([])); // Crear archivo
  console.log("Archivo 'networks.json' creado:", networksFilePath); // Log para confirmar creación del archivo
}

const readNetworks = (): any[] => {
  try {
    const data: Buffer = fs.readFileSync(networksFilePath);
    return JSON.parse(data.toString());
  } catch (error) {
    console.error("Error al leer las redes:", error);
    return [];
  }
};

const saveNetwork = (network: any): void => {
  try {
    const networks = readNetworks();
    networks.push(network);
    fs.writeFileSync(networksFilePath, JSON.stringify(networks, null, 2));
    console.log("Red guardada en networks.json en la ruta:", networksFilePath); // Añadir ruta absoluta al log
  } catch (error) {
    console.error("Error al guardar la red:", error);
  }
};

const readNodes = (networkId: string): any[] => {
  const networks = readNetworks();
  const network = networks.find((n) => n.id === networkId);
  return network ? network.nodes : [];
};

const saveNode = (networkId: string, node: any): void => {
  const networks = readNetworks();
  const network = networks.find((n) => n.id === networkId);
  if (network) {
    network.nodes.push(node);
    fs.writeFileSync(networksFilePath, JSON.stringify(networks, null, 2));
  }
};

export { readNetworks, saveNetwork, readNodes, saveNode };
