import * as http from 'http';
import * as net from 'net';

import config from '../config';
import logger from '../logger';

import HTTPHandler from './http-handler';

class HTTPServer {
  private handler: HTTPHandler;
  private server: http.Server | null = null;
  private sockets: Set<net.Socket>;

  constructor(handler: HTTPHandler) {
    this.sockets = new Set();
    this.handler = handler;
  }

  private handleConnect = (socket: net.Socket) => {
    logger.debug('[HTTP] new connection');
    this.sockets.add(socket);
    socket.on('close', () => {
      logger.debug('[HTTP] close connection');
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

    this.server = http.createServer();

    this.server.on('request',    this.handler.handleRequest);
    this.server.on('close',      this.handler.handleClose);
    this.server.on('error',      this.handler.handleError);
    this.server.on('connection', this.handleConnect);

    this.server.listen(config.httpServerPort, () => {
      logger.info(`[HTTP] server listen on port ${config.httpServerPort}`);
    });
  }

  stop = (): void => {
    if (this.server) {
      this.server.close();
      this.closeSockets();
      this.server =  null;
    }
  }
}

export default HTTPServer;
