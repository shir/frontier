import ApplicationManager from './applications/application-manager';

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

  start = () => {
    this.appManager.addApplications(config.applications);

    // this.appManager.runAll();

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
