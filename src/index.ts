import { createHttpServer } from './http-server';
import { createDNSServer } from './dns-server';

import Application from './application';

const workplaceApp = new Application({
  name:   'workplace',
  port:   5000,
  runCmd: 'bash -lc "rvm 2.3.1@workplace do bundle exec rails server -p 5000"',
});

const applications: Application[] = [
  workplaceApp,
];

const httpServer = createHttpServer(applications);
createDNSServer();

process.on('SIGINT', () => {
  httpServer.close();
});
