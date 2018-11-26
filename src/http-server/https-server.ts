import * as https from 'https';
import * as fs from 'fs';

import config from '../config';
import logger from '../logger';

import HTTPHandler from './http-handler';

class HTTPSServer {
  handler: HTTPHandler;
  server: https.Server | null = null;

  constructor(handler: HTTPHandler) {
    this.handler = handler;
  }

  start = (): void => {
    if (this.server) { this.stop(); }

    this.server = https.createServer({
      pfx:  fs.readFileSync('server.pfx'),
    });

    this.server.on('request', this.handler.handleRequest);
    this.server.on('close',   this.handler.handleClose);
    this.server.on('error',   this.handler.handleError);

    this.server.listen(config.httpsServerPort, () => {
      logger.info(`[HTTPS] server listen on port ${config.httpsServerPort}`);
    });
  }

  stop = (): void => {
    if (this.server) {
      this.server.close();
      this.server =  null;
    }
  }
}

export default HTTPSServer;
