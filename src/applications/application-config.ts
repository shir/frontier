import * as path from 'path';
import * as fs from 'fs';

import config from '../config';

class ApplicationConfig {
  public readonly name:         string;
  public readonly hostname:     string;
  public readonly port:         number;
  public readonly directory:    string;
  public readonly command?:     string;
  public readonly args:          string[];
  public readonly env:          { string: string };
  public readonly logFile?:     string;
  public readonly watchFile?:   string;
  public readonly idleTimeout?: number;

  constructor(appDir: string, port: number) {
    const configFilePath = path.join(appDir, config.appConfigFileName);
    if (!fs.existsSync(configFilePath)) {
      throw new Error(`File "${config.appConfigFileName}" not found for folder "${appDir}"`);
    }

    const jsonConfig = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));

    this.name        = jsonConfig.name || path.basename(appDir);
    this.hostname    = jsonConfig.hostname || `${this.name}.test`;
    this.port        = jsonConfig.port || port;
    this.directory   = jsonConfig.directory || fs.realpathSync(appDir);
    this.command     = jsonConfig.command;
    this.env         = jsonConfig.env || {};
    this.args        = this.replaceEnvs(jsonConfig.args);
    this.logFile     = jsonConfig.logFile && this.makePathAbsolute(jsonConfig.logFile);
    this.watchFile   = jsonConfig.watchFile && this.makePathAbsolute(jsonConfig.watchFile);

    if (jsonConfig.idleTimeout === 0) {
      this.idleTimeout = undefined;
    } else if (jsonConfig.idleTimeout) {
      this.idleTimeout = Number(jsonConfig.idleTimeout) * 1000;
    } else {
      this.idleTimeout = config.defaultIdleTimeout;
    }
  }

  private replaceEnvs = (args?: string[]): string[] => {
    if (!args) { return []; }

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

  private makePathAbsolute = (p: string): string => {
    if (path.isAbsolute(p)) { return p; }

    return path.join(this.directory, p);
  }
}

export default ApplicationConfig;

