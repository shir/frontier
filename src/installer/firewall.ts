import * as childProcess from 'child_process';

import config from '../config';
import logger from '../logger';

import Base from './base';

class FirewallInstaller extends Base {
  installPfAnchor = () => {
    this.renderTemplate(
      'pf-anchor',
      config.pfAnchorFilePath,
      {
        httpPort:  config.httpServerPort,
        httpsPort: config.httpsServerPort,
      },
    );
  }

  installPfConf = () => {
    this.renderTemplate(
      'pf.conf',
      config.pfConfFilePath,
      {
        anchor:         config.pfAnchorName,
        anchorFilePath: config.pfAnchorFilePath,
      },
    );
  }

  installLaunchDaemon = () => {
    this.renderTemplate(
      'pf-launch-daemon',
      config.pfLaunchDaemonPath,
      { pfConfFile: config.pfConfFilePath },
    );
  }

  runLaunchDaemon = () => {
    logger.info('Load firewall rules');
    childProcess.spawnSync(
      'launchctl',
      ['load', config.pfLaunchDaemonPath],
    );
  }

  perform = () => {
    this.installPfAnchor();
    this.installPfConf();
    this.installLaunchDaemon();
    this.runLaunchDaemon();
  }
}

export default FirewallInstaller;
