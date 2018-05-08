import config from '../config';

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

  perform = () => {
    this.installPfAnchor();
    this.installPfConf();
    this.installLaunchDaemon();
  }
}

export default FirewallInstaller;
