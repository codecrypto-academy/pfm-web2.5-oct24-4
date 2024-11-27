import Docker from "dockerode";
const docker = new Docker();

const createContainer = (containerConfig: any) =>
  docker.createContainer(containerConfig);

export { createContainer };
export default docker;
