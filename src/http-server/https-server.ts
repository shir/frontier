import * as https from 'https';
import * as fs from 'fs';
import * as net from 'net';

import config from '../config';
import logger from '../logger';

import HTTPHandler from './http-handler';

class HTTPSServer {
  private handler: HTTPHandler;
  private server: https.Server | null = null;
  private sockets: Set<net.Socket>;

  constructor(handler: HTTPHandler) {
    this.sockets = new Set();
    this.handler = handler;
  }

  private handleConnect = (socket: net.Socket) => {
    logger.debug('[HTTPS] new connection');
    this.sockets.add(socket);
    socket.on('close', () => {
      logger.debug('[HTTPS] close connection');
      this.sockets.delete(socket);
    });
  }

  private closeSockets = () => {
    for (const socket of this.sockets.values()) {
      socket.destroy();
      this.sockets.delete(socket);
    }
  }

  public start = (): void => {
    if (this.server) { this.stop(); }

    let pfxFile = null;
    try {
      pfxFile = fs.readFileSync(config.pfxFilePath);
    } catch (e) {
      logger.error(`[HTTPS] Can\'t read pfx file: ${e}`);
      logger.error('[HTTPS] Not started');
      return;
    }

    this.server = https.createServer({ pfx: pfxFile! });

    this.server.on('request',    this.handler.handleRequest);
    this.server.on('close',      this.handler.handleClose);
    this.server.on('error',      this.handler.handleError);
    this.server.on('connection', this.handleConnect);

    this.server.listen(config.httpsServerPort, () => {
      logger.info(`[HTTPS] server listen on port ${config.httpsServerPort}`);
    });
  }

  public stop = (): void => {
    if (this.server) {
      this.server.close();
      this.closeSockets();
      this.server =  null;
    }
  }
}

export default HTTPSServer;
