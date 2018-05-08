import * as path from 'path';
import * as fs from 'fs';

import logger from '../logger';
import config from '../config';

import * as ejs from 'ejs';

class ResolverInstaller {
  perform = () => {
    logger.info(`Write ${config.resolverFilePath}`);
    ejs.renderFile(
      path.join(__dirname, '..', 'templates', 'resolver.ejs'),
      { port: config.dnsServerPort },
      (err, result) => {
        if (err) {
          logger.error(`Error on rendering resolver template: ${err.message}`);
          return;
        }
        fs.writeFileSync(config.resolverFilePath, result, { mode: '0644' });
      },
    );
  }
}

export default ResolverInstaller;
