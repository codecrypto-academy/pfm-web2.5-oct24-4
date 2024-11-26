// src/config.ts
import dotenv from "dotenv";

dotenv.config();

export const config = {
  NODE_URL: process.env.URL_NODO || "",
  KEYSTORE_FILE: process.env.KEYSTORE_FILE || "",
  KEYSTORE_PWD: process.env.KEYSTORE_PWD || "",
};
