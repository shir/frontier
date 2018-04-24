import * as path from 'path';
import * as fs from 'fs';
import * as timers from 'timers';
import * as pty from 'node-pty';
import { ITerminal } from 'node-pty/lib/interfaces';

import { waitForService } from '../utils';

import logger from '../logger';
import config, { ApplicationConfig } from '../config';

class Application {
  name:       string;
  hostname:   string;
  port:       number;
  directory:  string;
  command:    string;
  args:       string[];
  logFile:    string;
  watchFile?: string;

  private process:   ITerminal | null = null;
  private logStream: fs.WriteStream | null = null;
  private watcher:   fs.FSWatcher | null = null;
  private idleTimer: NodeJS.Timer | null = null;

  constructor(params: ApplicationConfig) {
    this.name      = params.name;
    this.hostname  = params.hostname || `${params.name}.test`;
    this.port      = params.port;
    this.directory = params.directory || './';
    this.command   = params.command;
    this.args      = this.replaceEnvs(params.args || []);
    this.logFile   = path.join(config.logsDir, `${this.name}.log`);
    this.watchFile = params.watchFile ? path.join(this.directory, params.watchFile) : undefined;
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

  private watch = () => {
    if (!this.watchFile) { return; }

    logger.info(`[${this.name}] watching file ${this.watchFile}`);
    this.watcher = fs.watch(this.watchFile, () => this.restart());
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
    this.watch();

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
    logger.info(`[${this.name}] stop`);
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    if (this.logStream) {
      this.logStream.end();
      this.logStream = null;
    }
    if (this.process) {
      this.process.kill('SIGTERM');
      this.process = null;
    }
    if (this.idleTimer) {
      timers.clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  restart = (): void => {
    this.stop();
    this.run();
  }

  startAndWait = async () => {
    if (!this.process) {
      logger.info(`[${this.name}] is not running. Starting...`);
      this.run();
    }

    await waitForService(this.port);
  }

  killOnIdle = () => {
    if (this.idleTimer) {
      timers.clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }

    this.idleTimer = timers.setTimeout(
      () => {
        logger.info(
          `[${this.name}] Stopping after ${config.idleTimeout / (1000 * 60)}`
          + ` minutes idle.`);
        this.stop();
      },
      config.idleTimeout,
    );
  }
}

export { Application as default };
