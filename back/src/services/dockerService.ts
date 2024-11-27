import Docker from "dockerode";

const docker = new Docker();

const createContainer = async (containerConfig: any) => {
  try {
    const container = await docker.createContainer(containerConfig);
    return container;
  } catch (error) {
    console.error("Error al crear el contenedor:", error);
    throw error;
  }
};

export { createContainer };
