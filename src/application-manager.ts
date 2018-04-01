import Application from './application';
import { ApplicationConfig } from './config';

class ApplicationManager {
  readonly apps: Application[] = [];

  addApplication = (appParams: ApplicationConfig | Application) => {
    let app = null;
    if (appParams instanceof Application) {
      app = appParams;
    } else {
      app = new Application(appParams);
    }
    this.apps.push(app);
  }

  addApplications = (appsParams: ApplicationConfig[]) => {
    appsParams.forEach(params => this.addApplication(params));
  }

  appByHostname = (hostname: string) => {
    return this.apps.find(a => a.hostname === hostname);
  }

  runAll = () => {
    this.apps.forEach(a => a.run());
  }

  stopAll = () => {
    this.apps.forEach(a => a.stop());
  }
}

export default ApplicationManager;
