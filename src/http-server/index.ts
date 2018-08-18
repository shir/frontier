import * as http from 'http';
import HttpProxy from 'http-proxy';

import config from '../config';
import logger from '../logger';

import ApplicationManager from '../applications/application-manager';
import Application from '../applications/application';

class HTTPServer {
  appManager: ApplicationManager;
  server:     http.Server | null = null;
  proxy:      HttpProxy | null = null;

  constructor(appManager: ApplicationManager) {
    this.appManager = appManager;
  }

  private showError = (response: http.ServerResponse, error: string, httpCode: number = 404) => {
    logger.error(`[HTTP] ${error}`);
    response.writeHead(httpCode, { 'Content-Type':'text/plain' });
    response.write(error);
    response.end();
  }

  // private createPipe = (
  //   app: Application,
  //   request: http.IncomingMessage,
  //   response: http.ServerResponse,
  // ): void => {
  //   const requestOptions = {
  //     host:    'localhost',
  //     port:    app.config.port,
  //     path:    request.url,
  //     method:  request.method,
  //     headers: request.headers,
  //   };
  //   const proxyRequest = http.request(requestOptions, (proxyResponse) => {
  //     proxyResponse.pipe(response);
  //     proxyResponse.on('data', () => {});
  //     response.writeHead(Number(proxyResponse.statusCode), proxyResponse.headers);
  //   });
  //   proxyRequest.on('error', (e) => {
  //     this.showError(
  //       response,
  //       `Error on accessing "${app.name}" on port ${app.config.port}: ${e.message}`,
  //     );
  //   });
  //   request.pipe(proxyRequest);
  // }

  private applicationForRequest = (request: http.IncomingMessage): Application => {
    if (!request.headers.host) {
      throw new Error(`No host in request!`);
    }

    const app = this.appManager.appByHostname(request.headers.host);

    if (!app) {
      throw new Error(`Application for hostname ${request.headers.host} not found`);
    }

    return app;
  }

  private handleRequest = (request: http.IncomingMessage, response: http.ServerResponse): void => {
    try {
      const app = this.applicationForRequest(request);

      logger.debug(`[HTTP] ${app.name}: ${request.method} ${request.url}`);

      if (app.shouldRestart) {
        app.stop();
      }
      app.startAndWait().then(() => {
        this.proxy!.web(request, response, {
          target: {
            protocol: 'http',
            hostname: 'localhost',
            port:     String(app.config.port),
          },
        });
        // this.createPipe(app, request, response);
        app.killOnIdle();
      }).catch((e) => {
        this.showError(response, `Error on accessing application ${app.name}: ${e.message}`);
      });
    } catch (e) {
      this.showError(response, e.message);
    }
  }

  private handleClose = () => {
    logger.info('[HTTP] connection closed');
  }

  private handleError = (e: Error) => {
    logger.error(`[HTTP] error: ${e}`);
  }

  private handleProxyError = (
    e:        Error,
    _request: http.IncomingMessage,
    response: http.ServerResponse,
  ): void => {
    logger.error(`[PROXY] error: ${e}`);
    if (response) {
      this.showError(response, e.message, 500);
    }
  }

  private handleSocketUpgrade = (request: http.IncomingMessage, socket: any, head: any) => {
    if (!this.proxy) { return; }

    const app = this.applicationForRequest(request);

    logger.debug(`[WS] ${app.name}: ${request.method} ${request.url}`);

    this.proxy.ws(request, socket, head, {
      target: {
        protocol: 'http',
        hostname: '127.0.0.1',
        port:     String(app.config.port),
      },
    });
  }

  start = (): void => {
    if (this.server) { this.stop(); }

    this.proxy  = HttpProxy.createProxyServer();
    this.proxy.on('error', this.handleProxyError);

    this.server = http.createServer();

    this.server.on('request', this.handleRequest);
    this.server.on('close',   this.handleClose);
    this.server.on('error',   this.handleError);
    this.server.on('upgrade', this.handleSocketUpgrade);

    this.server.listen(config.httpServerPort, () => {
      logger.info(`[HTTP] server listen on port ${config.httpServerPort}`);
    });
  }

  stop = (): void => {
    if (this.server) {
      this.server.close();
      this.server =  null;
    }
    if (this.proxy) {
      this.proxy.close();
      this.proxy = null;
    }
  }
}

export default HTTPServer;
