import * as childProcess from 'child_process';

import { ApplicationConfig } from './config';

class Application {
  name:      string;
  hostname:  string;
  port:      number;
  directory: string;
  runCmd:    string;

  process:   childProcess.ChildProcess | null = null;

  constructor(params: ApplicationConfig) {
    this.name      = params.name;
    this.hostname  = params.hostname || `${params.name}.test`;
    this.port      = params.port;
    this.directory = params.directory || './';
    this.runCmd    = params.runCmd;
  }

  run = (): void => {
    console.log(`[${this.name}] run '${this.runCmd}' `
      + `in folder '${this.directory}' `
      + `using PORT=${this.port}`);

    this.process = childProcess.spawn(this.runCmd, [], {
      shell: true,
      stdio: 'inherit',
      cwd:   this.directory,
      env:   {
        ...process.env,
        PORT: this.port,
      },
    });

    this.process.on('exit', (code) => {
      console.log(`[${this.name}] child process exit with code: ${code}`);
      this.process = null;
    });
    this.process.on('error', (e) => {
      console.error(`[${this.name}] child process error: `, e.message);
      this.process = null;
    });
  }

  stop = (): void => {
    if (!this.process) return;

    this.process.kill();
  }
}

export { Application as default };
