import * as path from 'path';
import * as fs from 'fs';
import * as net from 'net';
import * as timers from 'timers';
import * as childProcess from 'child_process';
import logger from './logger';

function ensureDirExists(dir: string) {
  path.normalize(dir).split(path.sep).reduce(
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

function isPathDirectory(dirPath: string) {
  return fs.statSync(dirPath).isDirectory();
}

function isServiceAvailable(port: number): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();

    socket.on('error', (e: Error) => {
      socket.end();
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

function waitForService(
  process: childProcess.ChildProcess | null,
  port: number,
  interval: number = 1000,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!process) {
      reject();
      return;
    }

    let timeoutObj: NodeJS.Timer | null = null;

    const clear = () => {
      if (timeoutObj) {
        timers.clearTimeout(timeoutObj);
        timeoutObj = null;
      }
      if (process) {
        process.removeListener('exit',  handleError);
        process.removeListener('error', handleError);
      }
    };

    const handleError = (e: Error) => {
      clear();
      reject(e instanceof Error ? e : new Error('Process exit while waiting for start'));
    };

    const handleSuccess = () => {
      clear();
      resolve();
    };

    process.once('exit',  handleError);
    process.once('error', handleError);

    const checkServiceIsAvailable = () => {
      logger.debug(`checking service on port ${port} is available`);
      isServiceAvailable(port).then((isAvailable) => {
        if (!isAvailable) {
          if (timeoutObj) {
            timers.clearTimeout(timeoutObj);
          }
          timeoutObj = timers.setTimeout(
            checkServiceIsAvailable,
            interval,
          );
          return;
        }

        handleSuccess();
      }).catch(handleError);
    };

    checkServiceIsAvailable();
  });
}

export { ensureDirExists, isPathDirectory, isServiceAvailable, waitForService };
