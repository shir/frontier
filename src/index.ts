import Frontier from './frontier';

const frontier = new Frontier();

try {
  frontier.start();

  process.on('SIGINT', frontier.stop);
} catch (e) {
  frontier.stop();
  throw e;
}
