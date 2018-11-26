import * as http from 'http';

import config from '../config';
import logger from '../logger';

import HTTPHandler from './http-handler';

class HTTPServer {
  handler: HTTPHandler;
  server: http.Server | null = null;

  constructor(handler: HTTPHandler) {
    this.handler = handler;
  }

  start = (): void => {
    if (this.server) { this.stop(); }

    this.server = http.createServer();

    this.server.on('request', this.handler.handleRequest);
    this.server.on('close',   this.handler.handleClose);
    this.server.on('error',   this.handler.handleError);

    this.server.listen(config.httpServerPort, () => {
      logger.info(`[HTTP] server listen on port ${config.httpServerPort}`);
    });
  }

  stop = (): void => {
    if (this.server) {
      this.server.close();
      this.server =  null;
    }
  }
}

export default HTTPServer;
