import * as path from 'path';
import * as winston from 'winston';

import config from './config';
import { ensureDirExists } from './utils';

// interface FormatterOptions {
//   level:   number;
//   message: string;
// }

// const formatter = (options: FormatterOptions) => {
//   return winston.config.colorize(options.level, options.message);
// };

ensureDirExists(path.dirname(config.frontierLogFilePath));

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      // formatter,
      level: 'debug',
      colorize: true,
      prettyPrint: true,
    }),
    new winston.transports.File({
      // formatter,
      level: 'debug',
      filename: config.frontierLogFilePath,
      colorize: true,
      json: false,
    }),
  ],
});

export default logger;
