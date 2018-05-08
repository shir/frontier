import config from '../config';

import Base from './base';

class ResolverInstaller extends Base {
  perform = () => {
    this.renderTemplate(
      'resolver',
      config.resolverFilePath,
      { port: config.dnsServerPort },
    );
  }
}

export default ResolverInstaller;
