import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

const FRONTIER_DIR = '.frontier';

interface ApplicationConfig {
  name:       string;
  hostname?:  string;
  port:       number;
  directory?: string;
  command:    string;
  args?:      string[];
  watchFile?: string;
}

class Config {
  public readonly dnsServerPort:  number;
  public readonly httpServerPort:  number;
  public readonly httpsServerPort: number;
  public readonly idleTimeout:     number;

  public readonly configFilePath: string;
  public readonly logsDir: string;
  public readonly frontierLogFilePath: string;

  public readonly applications: ApplicationConfig[];

  constructor() {
    this.dnsServerPort   = 23400;
    this.httpServerPort  = 23401;
    this.httpsServerPort = 23402;
    this.idleTimeout     = 10 * 60 * 1000; // 10 minutes

    this.configFilePath      = path.join(os.homedir(), FRONTIER_DIR, 'config.json');
    this.logsDir             = path.join(os.homedir(), FRONTIER_DIR, 'logs');
    this.frontierLogFilePath = path.join(this.logsDir, 'frontier.log');

    this.applications = JSON.parse(fs.readFileSync(this.configFilePath, 'utf8')).applications;
  }
}

const config = new Config();


export { config as default, ApplicationConfig };
