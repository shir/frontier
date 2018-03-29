import { createHttpServer } from './http-server';
import { createDNSServer } from './dns-server';

const httpServer = createHttpServer();
createDNSServer();

process.on('SIGINT', () => {
  httpServer.close();
});
