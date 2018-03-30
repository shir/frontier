import Application, { ApplicationParams } from './application';

class ApplicationManager {
  readonly apps: Application[] = [];

  addApplication = (appParams: ApplicationParams | Application) => {
    let app = null;
    if (appParams instanceof Application) {
      app = appParams;
    } else {
      app = new Application(appParams);
    }
    this.apps.push(app);
  }

  addApplications = (appsParams: ApplicationParams[]) => {
    appsParams.forEach(params => this.addApplication(params));
  }

  appByHostname = (hostname: string) => {
    return this.apps.find(a => a.hostname === hostname);
  }
}

export default ApplicationManager;
