import * as dns from 'dns2';

const DNS_PORT   = 23400;

function createDNSServer() {
  const server = dns.createServer();

  server.on('request', (request, send) => {
    console.log('request: ', request);
    const response = new dns.Packet(request);

    const question = response.questions[0];

    response.header['qr'] = 1;
    response.header['ra'] = 1;

    response.answers.push({
      name:    question ? question.name : null,
      class:   dns.Packet.CLASS.IN,
      type:    dns.Packet.TYPE.A,
      address: '127.0.0.1',
      ttl:     300,
    });
    console.log('response: ', response);
    send(response);
  });

  server.listen(DNS_PORT, () => {
    console.log(`DNS server started on port ${DNS_PORT}`);
  });

  return server;
}

export { createDNSServer };
