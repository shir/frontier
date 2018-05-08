import * as fs from 'fs';
import * as path from 'path';

import config from '../config';
import logger from '../logger';

import Application from './application';
import ApplicationConfig from './application-config';

const PORTS_START = 5000;
const PORTS_END   = 6000;

class ApplicationManager {
  readonly apps: Application[] = [];
  readonly freePorts: number[] = [];

  constructor() {
    for (let i = PORTS_START; i <= PORTS_END; i += 1) {
      this.freePorts.push(i);
    }
  }

  public loadApplications = () => {
    if (!fs.existsSync(config.mainDir)) {
      logger.error(`"${config.mainDir} could not be found`);
      return;
    }

    fs.readdirSync(config.mainDir).forEach((file) => {
      try {
        const appConfig = new ApplicationConfig(
          path.join(config.mainDir, file),
          this.nextFreePort(),
        );
        this.addApplication(appConfig);
      } catch (e) {
        logger.error(e.message);
      }
    });
  }

  public addApplication = (appParams: ApplicationConfig | Application) => {
    let app = null;
    if (appParams instanceof Application) {
      app = appParams;
    } else {
      app = new Application(appParams);
    }
    this.apps.push(app);
    this.reservePort(app.config.port);
    logger.info(`"${app.name}" added on port ${app.config.port}`);
  }

  public appByHostname = (hostname: string) => {
    return this.apps.find(a => a.config.hostname === hostname);
  }

  public runAll = () => {
    this.apps.forEach(a => a.run());
  }

  public stopAll = () => {
    this.apps.forEach(a => a.stop());
  }

  private nextFreePort = (): number => {
    const port = this.freePorts[0];
    if (!port) {
      throw new Error('No free port is available');
    }
    return port;
  }

  private reservePort = (port: number) => {
    const idx = this.freePorts.indexOf(port);
    if (idx > -1) {
      this.freePorts.splice(idx, 1);
    }
  }
}

export default ApplicationManager;
