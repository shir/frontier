import * as http from 'http';

const HTTP_PORT  = 23401;
// const HTTPS_PORT = 23402;

function createHttpServer() {
  const server = http.createServer();

  server.on('request', (request, response) => {
    console.log('http request.headers: ', request.headers);

    const requestOptions = {
      host:    'localhost',
      port:    3000,
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
    // response.writeHead(200, { 'Content-Type':'text/plain' });
    // response.write('Hello world');
    // response.end();
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
