import * as path from 'path';
import * as fs from 'fs';

import logger from '../logger';

import * as ejs from 'ejs';

class BaseInstaller {
  renderTemplate = (templateName: string, dstPath: string, data: ejs.Data) => {
    logger.info(`Write ${dstPath}`);
    ejs.renderFile(
      path.join(__dirname, '..', 'templates', `${templateName}.ejs`),
      data,
      (err, result) => {
        if (err) {
          logger.error(`Error on rendering template "${templateName}: ${err.message}`);
          return;
        }
        fs.writeFileSync(dstPath, result, { mode: '0644' });
      },
    );
  }
}

export default BaseInstaller;
