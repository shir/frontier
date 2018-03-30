import * as fs from 'fs';

import ApplicationManager from './application-manager';
import { ApplicationParams } from './application';

import { createHttpServer } from './http-server';
import { createDNSServer } from './dns-server';

const APPS_FILE = './.frontier.json';

const appsParams: ApplicationParams[] = JSON.parse(fs.readFileSync(APPS_FILE, 'utf8'));
const appManager = new ApplicationManager();

appManager.addApplications(appsParams);

console.log('Applications loaded: ', appManager.apps.map(a => a.name).join(', '));

const dnsServer  = createDNSServer();
const httpServer = createHttpServer(appManager);

process.on('SIGINT', () => {
  dnsServer.socket.close();
  httpServer.close();
});
