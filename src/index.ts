import program from 'commander';

import Frontier from './frontier';
import Installer from './installer';

program
  .version('0.0.1');

program
  .command('install')
  .description('Install Frontier as service')
  .action(() => {
    new Installer().perform();
  });

program
  .command('start')
  .description('Start Frontier')
  .action(() => {
    const frontier = new Frontier();

    try {
      frontier.start();

      process.on('SIGINT', frontier.stop);
    } catch (e) {
      frontier.stop();
      throw e;
    }
  });

program.parse(process.argv);
