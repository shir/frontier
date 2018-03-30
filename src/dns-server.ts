import * as dns from 'dns2';

const DNS_PORT = 23400;

function createDNSServer() {
  const server = dns.createServer();

  server.on('request', (request, send) => {
    const response = new dns.Packet(request);

    const question = response.questions[0];

    response.header['qr'] = 1;
    response.header['ra'] = 1;

    const hostname = question ? question.name : null;
    console.log(`[DNS] resolve ${hostname}`);

    response.answers.push({
      name:    hostname,
      class:   dns.Packet.CLASS.IN,
      type:    dns.Packet.TYPE.A,
      address: '127.0.0.1',
      ttl:     300,
    });

    send(response);
  });

  server.socket.on('close', () => {
    console.log('[DNS] connection closed');
  });

  server.listen(DNS_PORT, () => {
    console.log(`[DNS] server listen on port ${DNS_PORT}`);
  });

  return server;
}

export { createDNSServer };
