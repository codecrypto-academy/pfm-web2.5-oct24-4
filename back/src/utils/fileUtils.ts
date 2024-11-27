import { statSync, mkdirSync, PathLike } from "fs";

const existsDir = (dir: PathLike) => {
  try {
    statSync(dir);
    return true;
  } catch (err) {
    return false;
  }
};

const createDir = (dir: PathLike) => {
  if (!existsDir(dir)) {
    mkdirSync(dir);
  }
};

export default { existsDir, createDir };
