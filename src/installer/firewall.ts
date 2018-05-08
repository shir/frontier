import * as path from 'path';
import * as fs from 'fs';

import logger from '../logger';
import config from '../config';

import * as ejs from 'ejs';

class FirewallInstaller {
  installPfAnchor = () => {
    logger.info(`Write ${config.pfAnchorFilePath}`);
    ejs.renderFile(
      path.join(__dirname, '..', 'templates', 'pf-anchor.ejs'),
      {
        httpPort:  config.httpServerPort,
        httpsPort: config.httpsServerPort,
      },
      (err, result) => {
        if (err) {
          logger.error(`Error on rendering PF anchor template: ${err.message}`);
          return;
        }
        fs.writeFileSync(config.pfAnchorFilePath, result, { mode: '0644' });
      },
    );
  }

  perform = () => {
    this.installPfAnchor();
  }
}

export default FirewallInstaller;
