import * as fs from 'fs';

import ApplicationManager from './application-manager';
import { ApplicationParams } from './application';

import config from './config';

import HTTPServer from './http-server';
import DNSServer  from './dns-server';

class Frontier {
  readonly appManager: ApplicationManager;
  readonly dnsServer:  DNSServer;
  readonly httpServer: HTTPServer;

  constructor() {
    this.appManager = new ApplicationManager();
    this.dnsServer  = new DNSServer();
    this.httpServer = new HTTPServer(this.appManager);
  }

  private getAppParams(file: string): ApplicationParams[] {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }

  start = () => {
    this.appManager.addApplications(this.getAppParams(config.apps_file));

    this.appManager.runAll();

    this.httpServer.start();
    this.dnsServer.start();
  }

  stop = () => {
    this.dnsServer.stop();
    this.httpServer.stop();
    this.appManager.stopAll();
  }
}

export default Frontier;
