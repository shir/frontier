import * as http from 'http';

// const DNS_PORT   = 23400;
const HTTP_PORT  = 23401;
// const HTTPS_PORT = 23402;

const httpServer = http.createServer();

httpServer.on('request', (request, response) => {
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

httpServer.listen(HTTP_PORT, () => {
  console.log(`Node server created at port ${HTTP_PORT}`);
});
