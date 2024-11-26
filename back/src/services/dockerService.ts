import { execSync } from "child_process";

export const createContainer = (containerConfig: any) => {
  // Lógica para crear un contenedor Docker
};

export const startContainer = (containerName: string) => {
  execSync(`docker start ${containerName}`);
};

export const stopContainer = (containerName: string) => {
  execSync(`docker stop ${containerName}`);
};

export const removeContainer = (containerName: string) => {
  execSync(`docker rm ${containerName}`);
};
