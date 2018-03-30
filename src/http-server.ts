import * as http from 'http';

import Application from './application';

const HTTP_PORT  = 23401;
// const HTTPS_PORT = 23402;

function createHttpServer(applications: Application[]) {
  const server = http.createServer();

  server.on('request', (request, response) => {
    console.log('http request.headers: ', request.headers);

    const app = applications.find(a => a.hostname === request.headers.host);

    if (!app) {
      response.writeHead(404, { 'Content-Type':'text/plain' });
      response.write(`Application for hostname ${request.headers.host} not found`);
      response.end();
      return;
    }

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
    console.log('Stopping HTTP server');
  });

  server.listen(HTTP_PORT, () => {
    console.log(`HTTP server started on port ${HTTP_PORT}`);
  });

  return server;
}

export { createHttpServer };
