import * as fs from 'fs';
import * as timers from 'timers';
import * as pty from 'node-pty';
import { ITerminal } from 'node-pty/lib/interfaces';

import { waitForService } from '../utils';

import logger from '../logger';
import AppConfig from './application-config';

class Application {
  readonly config: AppConfig;

  private process:   ITerminal | null = null;
  private logStream: fs.WriteStream | null = null;
  private watcher:   fs.FSWatcher | null = null;
  private idleTimer: NodeJS.Timer | null = null;

  constructor(config: AppConfig) {
    this.config = config;
  }

  get name() { return this.config.name; }

  private logOutput = (appProcess: ITerminal): void => {
    this.logStream = fs.createWriteStream(this.config.logFile, { flags: 'a' });

    appProcess.on('data', (data) => {
      process.stdout.write(data);

      if (this.logStream) {
        this.logStream.write(data);
      }
    });
  }

  private watch = () => {
    if (!this.config.watchFile) { return; }

    logger.info(`[${this.name}] watching file ${this.config.watchFile}`);
    this.watcher = fs.watch(this.config.watchFile, () => this.restart());
  }

  run = (): void => {
    logger.info(`[${this.name}] run '${this.config.command} ${this.config.args.join(' ')}' `
      + `in directory '${this.config.directory}' `
      + `using $PORT=${this.config.port}`);

    // I use `node-pty.spawn` instean `ChildProcess.spawn` because
    // when used `ChildProcess.spawn` with piped stdout `fully-buffered` is work
    // but using pty allows to keep `line-buffered`
    // See https://eklitzke.org/stdout-buffering for explanation.
    this.process = pty.spawn(this.config.command, this.config.args, {
      cwd:  this.config.directory,
      cols: process.stdout.columns,
      rows: process.stdout.rows,
      env:  {
        ...process.env,
        PORT: String(this.config.port),
        DIR:  this.config.directory,
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

    await waitForService(this.config.port);
  }

  killOnIdle = () => {
    if (!this.config.idleTimeout) { return; }

    if (this.idleTimer) {
      timers.clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }

    this.idleTimer = timers.setTimeout(
      () => {
        logger.info(
          `[${this.name}] Stopping after ${Number(this.config.idleTimeout) / (1000 * 60)}`
          + ` minutes idle.`);
        this.stop();
      },
      this.config.idleTimeout,
    );
  }
}

export { Application as default };
