import ApplicationManager from './applications/application-manager';

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

  public start = () => {
    this.appManager.loadApplications();

    this.httpServer.start();
    this.dnsServer.start();
  }

  public stop = () => {
    this.dnsServer.stop();
    this.httpServer.stop();
    this.appManager.stopAll();
  }
}

export default Frontier;
