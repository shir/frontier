import * as os from 'os';
import * as path from 'path';

const FRONTIER_DIR = '.frontier';

class Config {
  public readonly dnsServerPort:      number;
  public readonly httpServerPort:     number;
  public readonly httpsServerPort:    number;
  public readonly defaultIdleTimeout: number;

  public readonly appConfigFileName:   string;
  public readonly mainDir:             string;
  public readonly logsDir:             string;
  public readonly frontierLogFilePath: string;

  constructor() {
    this.dnsServerPort      = 23400;
    this.httpServerPort     = 23401;
    this.httpsServerPort    = 23402;
    this.defaultIdleTimeout = 10 * 60 * 1000;

    this.appConfigFileName   = '.frontier.json';
    this.mainDir             = path.join(os.homedir(),   FRONTIER_DIR);
    this.logsDir             = path.join(this.mainDir, 'logs');
    this.frontierLogFilePath = path.join(this.logsDir,   'frontier.log');
  }
}

const config = new Config();

export default config;
