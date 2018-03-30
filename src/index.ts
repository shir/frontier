import { createHttpServer } from './http-server';
import { createDNSServer } from './dns-server';

import Application from './application';

const apps: Application[] = [
];

const dnsServer  = createDNSServer();
const httpServer = createHttpServer(apps);

process.on('SIGINT', () => {
  dnsServer.socket.close();
  httpServer.close();
});
