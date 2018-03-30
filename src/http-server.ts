import * as http from 'http';

import ApplicationManager from './application-manager';

const HTTP_PORT  = 23401;
// const HTTPS_PORT = 23402;

function createHttpServer(manager: ApplicationManager) {
  const server = http.createServer();

  server.on('request', (request, response) => {
    const app = manager.appByHostname(request.headers.host);

    if (!app) {
      console.warn(`[HTTP] ${request.headers.host} NOT FOUND!`);
      response.writeHead(404, { 'Content-Type':'text/plain' });
      response.write(`Application for hostname ${request.headers.host} not found`);
      response.end();
      return;
    }

    console.log(`[HTTP] ${app.name}: ${request.url}`);

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
      response.writeHead(proxyResponse.statusCode, proxyResponse.headers);
    });
    request.pipe(proxyRequest);
  });

  server.on('close', () => {
    console.log('[HTTP] connection closed');
  });

  server.listen(HTTP_PORT, () => {
    console.log(`[HTTP] server listen on port ${HTTP_PORT}`);
  });

  return server;
}

export { createHttpServer };
