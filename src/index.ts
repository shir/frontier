import Commander from 'commander';

import Frontier from './frontier';

Commander
  .version('0.0.1')
  .option('-i, --install', 'Install Frontier as service')
  .parse(process.argv);

if (Commander.install) {
  console.log('Install');
} else {
  const frontier = new Frontier();

  try {
    frontier.start();

    process.on('SIGINT', frontier.stop);
  } catch (e) {
    frontier.stop();
    throw e;
  }
}
