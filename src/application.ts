import * as childProcess from 'child_process';

interface ApplicationParams {
  name:      string;
  hostname?: string;
  port:      number;
  runCmd:    string;
}

class Application {
  name:     string;
  hostname: string;
  port:     number;
  runCmd:   string;
  pid:      number | null = null;

  constructor(params: ApplicationParams) {
    this.name     = params.name;
    this.hostname = params.hostname || `${params.name}.test`;
    this.port     = params.port;
    this.runCmd   = params.runCmd;
  }

  run = () => {
    childProcess.exec(this.runCmd);
  }
}

export default Application;
