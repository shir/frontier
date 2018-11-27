import * as os from 'os';
import * as path from 'path';

const FRONTIER_DIR = '.frontier';

class Config {
  public readonly domain: string;

  public readonly dnsServerPort:      number;
  public readonly httpServerPort:     number;
  public readonly httpsServerPort:    number;
  public readonly defaultIdleTimeout: number;

  public readonly appConfigFileName:   string;
  public readonly mainDir:             string;
  public readonly frontierLogFilePath: string;

  public readonly keyFilePath:  string;
  public readonly certFilePath: string;
  public readonly pfxFilePath:  string

  public readonly resolverFilePath:   string;
  public readonly pfAnchorName:       string;
  public readonly pfAnchorFilePath:   string;
  public readonly pfConfFilePath:     string;
  public readonly pfLaunchDaemonPath: string;

  constructor() {
    this.domain = 'dev.test'

    this.dnsServerPort      = 23400;
    this.httpServerPort     = 23401;
    this.httpsServerPort    = 23402;
    this.defaultIdleTimeout = 10 * 60 * 1000;

    this.appConfigFileName   = '.frontier.json';
    this.mainDir             = path.join(os.homedir(),   FRONTIER_DIR);
    this.frontierLogFilePath = path.join(this.mainDir, 'frontier.log');

    this.keyFilePath  = path.join(this.mainDir, 'frontier.key');
    this.certFilePath = path.join(this.mainDir, 'frontier.crt');
    this.pfxFilePath  = path.join(this.mainDir, 'frontier.pfx');

    this.resolverFilePath   = `/etc/resolver/${this.domain}`;
    this.pfAnchorName       = 'frontier';
    this.pfAnchorFilePath   = `/etc/pf.anchors/${this.pfAnchorName}`;
    this.pfConfFilePath     = `/etc/pf.${this.pfAnchorName}.conf`;
    this.pfLaunchDaemonPath = '/Library/LaunchDaemons/me.shir.frontier.firewall.plist';
  }
}

const config = new Config();

export default config;
