import * as fs from 'fs';
import * as timers from 'timers';
import * as path from 'path';
import * as childProcess from 'child_process';

import { waitForService, ensureDirExists } from '../utils';

import logger from '../logger';
import AppConfig from './application-config';

class Application {
  readonly config: AppConfig;

  private process:   childProcess.ChildProcess | null = null;
  private logStream: fs.WriteStream | null = null;
  private watcher:   fs.FSWatcher | null = null;
  private idleTimer: NodeJS.Timer | null = null;
  private watchFileChanged: boolean = false;

  constructor(config: AppConfig) {
    this.config = config;
  }

  get name()          { return this.config.name; }
  get shouldRestart() { return this.watchFileChanged; }

  private logOutput = (appProcess: childProcess.ChildProcess): void => {
    if (!this.config.logFile) { return; }

    ensureDirExists(path.dirname(this.config.logFile));
    this.logStream = fs.createWriteStream(this.config.logFile, { flags: 'a' });

    appProcess.stdout.on('data', d => this.logStream && this.logStream.write(d));
    appProcess.stderr.on('data', d => this.logStream && this.logStream.write(d));
    // appProcess.stdout.pipe(this.logStream);
    // appProcess.stderr.pipe(this.logStream);
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
    if (!this.config.command) { return; }

    logger.info(`[${this.name}] run '${this.config.command} ${this.config.args.join(' ')}' `
      + `in directory '${this.config.directory}' `
      + `using $PORT=${this.config.port}`);

    this.process = childProcess.spawn(this.config.command, this.config.args, {
      shell: true,
      stdio: [
        'ignore',
        this.config.logFile ? 'pipe' : 'ignore',
        this.config.logFile ? 'pipe' : 'ignore',
      ],
      cwd:   this.config.directory,
      env:   {
        ...process.env,
        ...this.config.env,
        PORT: String(this.config.port),
        DIR:  this.config.directory,
      },
    });

    this.logOutput(this.process);
    this.watch();

    this.process.once('exit', (code) => {
      logger.info(`[${this.name}] child process exit with code: ${code}`);
      this.process = null;
      this.stop();
    });
    this.process.once('error', (e) => {
      logger.error(`[${this.name}] child process error: `, e.message);
      this.stop();
    });
  }

  public stop = (): void => {
    logger.info(`[${this.name}] stop`);
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    if (this.logStream) {
      this.logStream.end();
      this.logStream = null;
    }
    if (this.idleTimer) {
      timers.clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  public startAndWait = async () => {
    let isStarting = false;
    if (!this.config.command) {
      logger.info(`[${this.name}] have no command. Just proxy.`);
      return;
    }
    if (!this.process) {
      logger.info(`[${this.name}] is not running. Starting...`);
      this.run();
      isStarting = true;
    }

    await waitForService(this.process, this.config.port);
    if (isStarting) {
      logger.info(`[${this.name}] started. pid: ${this.process && this.process.pid}`);
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
