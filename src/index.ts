import { createHttpServer } from './http-server';

const httpServer = createHttpServer();

process.on('SIGINT', () => {
  httpServer.close();
});
