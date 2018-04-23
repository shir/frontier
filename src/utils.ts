import * as path from 'path';
import * as fs from 'fs';
import * as net from 'net';
import * as timers from 'timers';

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

function isServiceAvailable(port: number): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();

    socket.on('error', (e: Error) => {
      // @ts-ignore TS2339
      if (e.code === 'ECONNREFUSED') {
        resolve(false);
      } else {
        reject(e);
      }
    });
    socket.on('connect', () => {
      socket.end();
      resolve(true);
    });

    socket.connect({ port });
  });
}

function waitForService(port: number, interval: number = 1000): Promise<void> {
  return new Promise((resolve, reject) => {
    const intervalObj = timers.setInterval(
      () => {
        isServiceAvailable(port).then((isAvailable) => {
          if (!isAvailable) { return; }

          timers.clearInterval(intervalObj);
          resolve();
        }).catch(reject);
      },
      interval,
    );
  });
}

export { ensureDirExists, isServiceAvailable, waitForService };
