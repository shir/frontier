import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

const FRONTIER_DIR = '.frontier';

interface ApplicationConfig {
  name:       string;
  hostname?:  string;
  port:       number;
  directory?: string;
  runCmd:     string;
}

class Config {
  public dnsServerPort   = 23400;
  public httpServerPort  = 23401;
  public httpsServerPort = 23402;

  public configFilePath = path.join(os.homedir(), FRONTIER_DIR, 'config.json');
  public logsDir        = path.join(os.homedir(), FRONTIER_DIR, 'logs');

  public applications: ApplicationConfig[];

  constructor() {
    this.applications = JSON.parse(fs.readFileSync(this.configFilePath, 'utf8')).applications;
  }
}

const config = new Config();


export { config as default, ApplicationConfig };
