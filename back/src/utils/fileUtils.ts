import fs from "fs";

export function existsDir(dir: fs.PathLike): boolean {
  try {
    fs.statSync(dir);
    return true;
  } catch (err) {
    return false;
  }
}

export function createDir(dir: fs.PathLike): void {
  if (!existsDir(dir)) {
    fs.mkdirSync(dir);
  }
}
