import * as http from 'http';

import config from '../config';
import logger from '../logger';

import ApplicationManager from '../application-manager';
import Application from '../application';

class HTTPServer {
  appManager: ApplicationManager;
  server:     http.Server | null = null;

  constructor(appManager: ApplicationManager) {
    this.appManager = appManager;
  }

  private showError = (response: http.ServerResponse, error: string, httpCode: number = 404) => {
    logger.error(`[HTTP] ${error}`);
    response.writeHead(httpCode, { 'Content-Type':'text/plain' });
    response.write(error);
    response.end();
  }

  private createPipe = (
    app: Application,
    request: http.IncomingMessage,
    response: http.ServerResponse,
  ): void => {
    const requestOptions = {
      host:    'localhost',
      port:    app.port,
      path:    request.url,
      method:  request.method,
      headers: request.headers,
    };
    const proxyRequest = http.request(requestOptions, (proxyResponse) => {
      proxyResponse.pipe(response);
      proxyResponse.on('data', () => {
      });
      response.writeHead(Number(proxyResponse.statusCode), proxyResponse.headers);
    });
    proxyRequest.on('error', (e) => {
      this.showError(
        response,
        `Error on accessing "${app.name}" on port ${app.port}: ${e.message}`,
      );
    });
    request.pipe(proxyRequest);
  }

  private handleRequest = (request: http.IncomingMessage, response: http.ServerResponse): void => {
    if (!request.headers.host) {
      this.showError(response, `No host in request!`);
      return;
    }

    const app = this.appManager.appByHostname(request.headers.host);

    if (!app) {
      this.showError(response, `Application for hostname ${request.headers.host} not found`);
      return;
    }

    logger.debug(`[HTTP] ${app.name}: ${request.url}`);

    this.createPipe(app, request, response);
  }

  private handleClose = () => {
    logger.info('[HTTP] connection closed');
  }

  private handleError = (e: Error) => {
    logger.error(`[HTTP] error: ${e}`);
  }

  start = (): void => {
    if (this.server) { this.stop(); }

    this.server = http.createServer();

    this.server.on('request', this.handleRequest);
    this.server.on('close',   this.handleClose);
    this.server.on('error',   this.handleError);

    this.server.listen(config.httpServerPort, () => {
      logger.info(`[HTTP] server listen on port ${config.httpServerPort}`);
    });
  }

  stop = (): void => {
    if (!this.server) { return; }

    this.server.close();
    this.server =  null;
  }
}

export default HTTPServer;
