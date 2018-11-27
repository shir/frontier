import * as http from 'http';
import HttpProxy from 'http-proxy';

import logger from '../logger';

import ApplicationManager from '../applications/application-manager';
import Application from '../applications/application';

import HTTPServer from './http-server';
import HTTPSServer from './https-server';

class HTTPHandler {
  appManager:  ApplicationManager;
  httpServer:  HTTPServer;
  httpsServer: HTTPSServer;
  proxy:       HttpProxy | null = null;

  constructor(appManager: ApplicationManager) {
    this.appManager  = appManager;
    this.httpServer  = new HTTPServer(this);
    this.httpsServer = new HTTPSServer(this);
  }

  private showError = (response: http.ServerResponse, error: string, httpCode: number = 404) => {
    logger.error(`[HTTP] ${error}`);
    response.writeHead(httpCode, { 'Content-Type':'text/plain' });
    response.write(error);
    response.end();
  }

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

  private startApplication = (
    app:      Application,
    request:  http.IncomingMessage,
    response: http.ServerResponse,
  ) => {
    app.startAndWait().then(() => {
      this.proxy!.web(request, response, {
        target: {
          protocol: 'http',
          hostname: 'localhost',
          port:     String(app.config.port),
        },
        xfwd: true,
        ws:   true,
      });
      app.killOnIdle();
    }).catch((e) => {
      this.showError(response, `Error on accessing application ${app.name}: ${e.message}`);
    });
  }

  public handleRequest = (request: http.IncomingMessage, response: http.ServerResponse): void => {
    try {
      const app = this.applicationForRequest(request);

      logger.debug(`[HTTP] ${app.name}: ${request.method} ${request.url}`);

      if (app.shouldRestart) {
        app.stop().then(() => {
          this.startApplication(app, request, response);
        })
      } else {
        this.startApplication(app, request, response);
      }
    } catch (e) {
      this.showError(response, e.message);
    }
  }

  public handleClose = () => {
    logger.info(`[HTTP] connection closed`);
  }

  public handleError = (e: Error) => {
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

  public start = (): void => {
    this.stop();

    this.proxy  = HttpProxy.createProxyServer();
    this.proxy.on('error', this.handleProxyError);

    this.httpServer.start();
    this.httpsServer.start();
  }

  public stop = (): void => {
    this.httpServer.stop();
    this.httpsServer.stop();
    if (this.proxy) {
      this.proxy.close();
      this.proxy = null;
    }
  }
}

export default HTTPHandler;
