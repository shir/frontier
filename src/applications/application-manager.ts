import * as fs from 'fs';

import config from '../config';
import Application from './application';
import ApplicationConfig from './application-config';

class ApplicationManager {
  readonly apps: Application[] = [];

  public loadApplications = () => {
    JSON.parse(fs.readFileSync(config.configFilePath, 'utf8')).applications
      .forEach((json: any) => this.addApplication(new ApplicationConfig(json)));
  }

  public addApplication = (appParams: ApplicationConfig | Application) => {
    let app = null;
    if (appParams instanceof Application) {
      app = appParams;
    } else {
      app = new Application(appParams);
    }
    this.apps.push(app);
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
