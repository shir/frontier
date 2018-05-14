import * as fs from 'fs';
import * as timers from 'timers';
import * as child_process from 'child_process';

import { waitForService } from '../utils';

import logger from '../logger';
import AppConfig from './application-config';

class Application {
  readonly config: AppConfig;

  private process:   child_process.ChildProcess | null = null;
  private logStream: fs.WriteStream | null = null;
  private watcher:   fs.FSWatcher | null = null;
  private idleTimer: NodeJS.Timer | null = null;
  private watchFileChanged: boolean = false;

  constructor(config: AppConfig) {
    this.config = config;
  }

  get name()          { return this.config.name; }
  get shouldRestart() { return this.watchFileChanged; }

  private logOutput = (appProcess: child_process.ChildProcess): void => {
    if (!this.config.logFile) { return; }

    this.logStream = fs.createWriteStream(this.config.logFile, { flags: 'a' });

    appProcess.stdout.pipe(this.logStream);
  }

  private watch = () => {
    if (!this.config.watchFile) { return; }

    this.watchFileChanged = false;
    logger.info(`[${this.name}] watching file ${this.config.watchFile}`);
    this.watcher = fs.watch(this.config.watchFile, () => {
      logger.debug(`[${this.name}] watching file changed. Restart planned.`);
      this.watchFileChanged = true;
    });
  }

  public run = (): void => {
    logger.info(`[${this.name}] run '${this.config.command} ${this.config.args.join(' ')}' `
      + `in directory '${this.config.directory}' `
      + `using $PORT=${this.config.port}`);

    this.process = child_process.spawn(this.config.command, this.config.args, {
      shell: true,
      stdio: 'pipe',
      cwd:   this.config.directory,
      env:   {
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

  public stop = (): void => {
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
      this.process.kill();
      this.process = null;
    }
    if (this.idleTimer) {
      timers.clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  public startAndWait = async () => {
    let isStarting = false;
    if (!this.process) {
      logger.info(`[${this.name}] is not running. Starting...`);
      this.run();
      isStarting = true;
    }

    await waitForService(this.config.port);
    if (isStarting) {
      logger.info(`[${this.name}] started.`);
    }
  }

  public killOnIdle = () => {
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
