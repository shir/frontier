import * as fs from 'fs';

import ApplicationManager from './application-manager';
import { ApplicationParams } from './application';

import HTTPServer from './http-server';
import DNSServer  from './dns-server';

const APPS_FILE = './.frontier.json';

const appsParams: ApplicationParams[] = JSON.parse(fs.readFileSync(APPS_FILE, 'utf8'));
const appManager = new ApplicationManager();
const dnsServer  = new DNSServer();
const httpServer = new HTTPServer(appManager);


try {
  appManager.addApplications(appsParams);

  appManager.runAll();

  httpServer.start();
  dnsServer.start();

  process.on('SIGINT', () => {
    dnsServer.stop();
    httpServer.stop();

    appManager.stopAll();
  });

} catch (e) {
  dnsServer.stop();
  httpServer.stop();
  appManager.stopAll();

  throw e;
}
