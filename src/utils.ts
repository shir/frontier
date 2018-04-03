import * as path from 'path';
import * as fs from 'fs';

function ensureDirExists(dir: string) {
  dir.split(path.sep).reduce(
    (parentDir, childDir) => {
      const curDir = path.resolve(parentDir, childDir);

      if (!fs.existsSync(curDir)) {
        fs.mkdirSync(curDir);
      }

      return curDir;
    },
    '/',
  );
}

export { ensureDirExists };
