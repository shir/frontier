import * as fs from 'fs';

import ApplicationManager from './application-manager';
import { ApplicationParams } from './application';

import HTTPServer from './http-server';
import { createDNSServer } from './dns-server';

const APPS_FILE = './.frontier.json';

const appsParams: ApplicationParams[] = JSON.parse(fs.readFileSync(APPS_FILE, 'utf8'));
const appManager = new ApplicationManager();

try {
  appManager.addApplications(appsParams);

  appManager.runAll();

  const dnsServer  = createDNSServer();
  const httpServer = new HTTPServer(appManager);

  httpServer.start();

  process.on('SIGINT', () => {
    dnsServer.socket.close();
    httpServer.stop();

    appManager.stopAll();
  });

  process.on('uncaughtException', (err) => {
    if (appManager) {
      appManager.stopAll();
    }

    throw err;
  });
} catch (e) {
  appManager.stopAll();
  throw e;
}
