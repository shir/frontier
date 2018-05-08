import * as fs from 'fs';
import * as path from 'path';

import config from '../config';
import logger from '../logger';

import Application from './application';
import ApplicationConfig from './application-config';

class ApplicationManager {
  readonly apps: Application[] = [];

  public loadApplications = () => {
    if (!fs.existsSync(config.mainDir)) {
      logger.error(`"${config.mainDir} could not be found`);
      return;
    }

    fs.readdirSync(config.mainDir).forEach((file) => {
      const appDir = path.join(config.mainDir, file);
      const stats = fs.statSync(appDir);
      if (stats.isDirectory()) {
        const configFilePath = path.join(appDir, config.appConfigFileName);
        if (fs.existsSync(configFilePath)) {
          const jsonConfig = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
          this.addApplication(new ApplicationConfig(appDir, jsonConfig));
        } else {
          logger.warn(
            `File "${config.appConfigFileName}" not found for folder "${file}". Skipping`);
        }
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
}

export default ApplicationManager;
