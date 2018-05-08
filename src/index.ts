import program from 'commander';

import Frontier from './frontier';
import ResolverInstaller from './installer/resolver';

program
  .version('0.0.1');

program
  .command('install-resolver')
  .description('Install resolver part for Frontier')
  .action(() => {
    new ResolverInstaller().perform();
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
