import * as path from 'path';
import * as fs from 'fs';
import * as pty from 'node-pty';
import { ITerminal } from 'node-pty/lib/interfaces';

import logger from './logger';
import config, { ApplicationConfig } from './config';

class Application {
  name:      string;
  hostname:  string;
  port:      number;
  directory: string;
  command:   string;
  args:      string[];
  logFile:   string;

  private process:   ITerminal | null = null;
  private logStream: fs.WriteStream | null = null;

  constructor(params: ApplicationConfig) {
    this.name      = params.name;
    this.hostname  = params.hostname || `${params.name}.test`;
    this.port      = params.port;
    this.directory = params.directory || './';
    this.command   = params.command;
    this.args      = this.replaceEnvs(params.args || []);
    this.logFile   = path.join(config.logsDir, `${this.name}.log`);
  }

  private replaceEnvs = (args: string[]): string[] => {
    return args.map((arg:string) => {
      switch (arg) {
        case '$PORT':
          return String(this.port);
        case '$DIR':
          return String(this.directory);
        default:
          return arg;
      }
    });
  }

  private logOutput = (appProcess: ITerminal): void => {
    this.logStream = fs.createWriteStream(this.logFile, { flags: 'a' });

    appProcess.on('data', (data) => {
      process.stdout.write(data);

      if (this.logStream) {
        this.logStream.write(data);
      }
    });
  }

  run = (): void => {
    logger.info(`[${this.name}] run '${this.command} ${this.args.join(' ')}' `
      + `in directory '${this.directory}' `
      + `using $PORT=${this.port}`);

    // I use `node-pty.spawn` instean `ChildProcess.spawn` because
    // when used `ChildProcess.spawn` with piped stdout `fully-buffered` is work
    // but using pty allows to keep `line-buffered`
    // See https://eklitzke.org/stdout-buffering for explanation.
    this.process = pty.spawn(this.command, this.args, {
      cwd:  this.directory,
      cols: process.stdout.columns,
      rows: process.stdout.rows,
      env:  {
        ...process.env,
        PORT: String(this.port),
        DIR:  this.directory,
      },
    });

    this.logOutput(this.process);

    this.process.on('exit', (code) => {
      logger.info(`[${this.name}] child process exit with code: ${code}`);
      this.process = null;
    });
    this.process.on('error', (e) => {
      logger.error(`[${this.name}] child process error: `, e.message);
      this.process = null;
    });
  }

  stop = (): void => {
    if (this.logStream) {
      this.logStream.end();
      this.logStream = null;
    }
    if (this.process) {
      this.process.kill('SIGTERM');
      this.process = null;
    }
  }
}

export { Application as default };
