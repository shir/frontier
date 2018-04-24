import * as path from 'path';

import config from '../config';

class ApplicationConfig {
  public readonly name:         string;
  public readonly hostname:     string;
  public readonly port:         number;
  public readonly directory:    string;
  public readonly command:      string;
  public readonly args:         string[];
  public readonly logFile:      string;
  public readonly watchFile?:   string;
  public readonly idleTimeout?: number;

  constructor(jsonConfig: any) {
    this.name        = jsonConfig.name;
    this.hostname    = jsonConfig.hostname || `${jsonConfig.name}.test`;
    this.port        = jsonConfig.port;
    this.directory   = jsonConfig.directory || './';
    this.command     = jsonConfig.command;
    this.args        = this.replaceEnvs(jsonConfig.args || []);
    this.logFile     = path.join(config.logsDir, `${this.name}.log`);
    this.watchFile   = jsonConfig.watchFile && path.join(this.directory, jsonConfig.watchFile);

    if (jsonConfig.idleTimeout === 0) {
      this.idleTimeout = undefined;
    } else if (jsonConfig.idleTimeout) {
      this.idleTimeout = Number(jsonConfig.idleTimeout) * 1000;
    } else {
      this.idleTimeout = config.defaultIdleTimeout;
    }
  }

  private replaceEnvs = (args: string[]): string[] => {
    return args.map((arg:string) => {
      switch (arg) {
        case '$PORT':
          return String(this.port);
        case '$DIR':
          return String(this.directory);
        default:
          return arg;
      }
    });
  }
}

export default ApplicationConfig;

