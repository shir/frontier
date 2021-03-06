import program from 'commander';

import Frontier from './frontier';
import ResolverInstaller from './installer/resolver';
import FirewallInstaller from './installer/firewall';
import CertificateGenerator from './certificate-generator';

program
  .version('0.0.1');

program
  .command('help')
  .description('Displays help')
  .action(() => {
    program.help();
  });

program
  .command('install-resolver')
  .description('Install resolver part for Frontier')
  .action(() => {
    new ResolverInstaller().perform();
  });

program
  .command('install-firewall')
  .description('Install firewall rules for Frontier')
  .action(() => {
    new FirewallInstaller().perform();
  });

program
  .command('install')
  .description('Install resolver and firewall rules for Frontier')
  .action(() => {
    new ResolverInstaller().perform();
    new FirewallInstaller().perform();
  });

program
  .command('gencert')
  .description('Generate self-signed certificate to use for HTTPS')
  .action(() => {
    new CertificateGenerator().perform();
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

if (program.args.length === 0) {
  program.help();
}
