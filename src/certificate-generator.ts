import * as childProcess from 'child_process';

import logger from './logger';
import config from './config';

class CertificateGenerator {
  private generateCertificate() {
    logger.info('Generate certificate');

    //  openssl req -newkey rsa:2048 -x509 -nodes -sha256 -days 3650 -new
    //    -keyout server.dev.test.key \
    //    -out server.dev.test.crt
    //    -subj /CN=*.dev.test -reqexts SAN -extensions SAN \
    //    -config <(cat /System/Library/OpenSSL/openssl.cnf; printf '[SAN]\nsubjectAltName=DNS:*.dev.test')

    const result = childProcess.spawnSync(
      '/bin/bash',
      [
        '-c',
        'openssl req -newkey rsa:2048 -x509 -nodes -sha256 -days 3650 -new' +
        ` -keyout ${config.keyFilePath} -out ${config.certFilePath}` +
        ` -subj /CN='Frontier' -reqexts SAN -extensions SAN` +
        ` -config <(cat /System/Library/OpenSSL/openssl.cnf; printf '[SAN]\\nsubjectAltName=DNS:*.${config.domain}')`,
      ],
      { stdio: 'inherit' },
    );

    if (result.status) {
      throw new Error(`Certificate generatation returned status: ${result.status}`);
    }
  }

  private generateContainer() {
    logger.info('Generate PFX container');

    // openssl pkcs12 -export -out server.dev.test.pfx -inkey server.dev.test.key -in server.dev.test.crt
    const result = childProcess.spawnSync(
      'openssl',
      [
        'pkcs12', '-export', '-out', config.pfxFilePath,
        '-inkey', config.keyFilePath, '-in', config.certFilePath,
      ],
      { stdio: 'inherit' },
    );

    if (result.status) {
      throw new Error(`Certificate generatation returned status: ${result.status}`);
    }
  }

  public perform() {
    try {
      this.generateCertificate();
      this.generateContainer();
    } catch(e) {
      logger.error(e);
    }
  }
}

export default CertificateGenerator;
