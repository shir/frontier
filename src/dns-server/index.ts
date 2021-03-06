import * as dns from 'dns2';

import config from '../config';
import logger from '../logger';

class DNSServer {
  public server: dns.Server | null = null;

  private handleRequest: dns.listener = (request, send) => {
    const response = new dns.Packet(request);

    const question = response.questions[0];

    response.header['qr'] = 1;
    response.header['ra'] = 1;

    const hostname = question ? question.name : null;
    logger.debug(`[DNS] resolve ${hostname}`);

    response.answers.push({
      name:    hostname,
      class:   dns.Packet.CLASS.IN,
      type:    dns.Packet.TYPE.A,
      address: '127.0.0.1',
      ttl:     300,
    });

    send(response);
  }

  private handleClose = () => {
    logger.info('[DNS] connection closed');
  }

  start = () => {
    this.server = dns.createServer();

    this.server.on('request', this.handleRequest);
    this.server.socket.on('close', this.handleClose);

    this.server.listen(config.dnsServerPort, () => {
      logger.info(`[DNS] server listen on port ${config.dnsServerPort}`);
    });
  }

  stop = () => {
    if (!this.server) { return; }

    this.server.socket.close();
    this.server = null;
  }
}

export default DNSServer;
