// src/utils/config.ts
export const config = {
  NODE_URL: process.env.NODE_URL || "http://localhost:8545", // URL del nodo RPC
  KEYSTORE_FILE: process.env.KEYSTORE_FILE || "path/to/keystore/file", // Ruta al archivo de keystore
  KEYSTORE_PWD: process.env.KEYSTORE_PWD || "your-password", // Contraseña del keystore
  PORT: process.env.PORT || 3000, // Puerto del servidor
};
