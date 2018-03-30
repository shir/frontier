import * as fs from 'fs';

import Application, { ApplicationParams } from './application';

import { createHttpServer } from './http-server';
import { createDNSServer } from './dns-server';

const APPS_FILE = './.frontier.json';

const appsParams: ApplicationParams[] = JSON.parse(fs.readFileSync(APPS_FILE, 'utf8'));
const apps: Application[] = appsParams.map(params => new Application(params));

console.log('Applications loaded: ', apps.map(a => a.name).join(', '));

const dnsServer  = createDNSServer();
const httpServer = createHttpServer(apps);

process.on('SIGINT', () => {
  dnsServer.socket.close();
  httpServer.close();
});
