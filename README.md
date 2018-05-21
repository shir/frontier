Frontier is an application manager for development servers.
(Something like [pow](http://pow.cx))

**It's not production ready. Use on own risk**

Contribution is welcome.

# Motivation

[Pow](http://pow.cx), which I like very much, is out of date,
doesn't support HTTPS and is only for rack-based applications. I've used
[Invoker](http://invoker.codemancers.com) for some time but is not happy
with it. And looks like it's abandoned too.

# Install

Clone repo:
```sh
$ git clone https://github.com/shir/frontier.git && cd frontier
```

Install required packages:
```sh
$ npm install
```

Build project:
```sh
$ npm run build && npm run templates
```

Install resolver and firewall rules
```sh
$ sudo bin/frontier install
```

# Configure

Link your development application in `~/.frontier/` folder. For example:
```
$ cd ~/.frontier
$ ln -s ~/projects/my-favorite-project
```

Create `.frontier.json` file in project folder

## Rails with RVM

```json
{
  "command":   "rvm",
  "args":      ["in", "$DIR", "do", "bundle", "exec", "rails", "server", "-p", "$PORT", "-b", "127.0.0.1"],
  "watchFile": "tmp/restart.txt"
}
```

## Node.js

```json
{
  "command":   "npm",
  "args":      ["run", "start"],
  "watchFile": "tmp/restart.txt"
}
```

## Create React App

```json
{
  "command":   "yarn",
  "args":      ["run", "start"],
  "watchFile": "tmp/restart.txt"
}
```

In project in `.env` file set:
```
BROWSER=none
HOST=my-favorite-project.test
```
## All available options:

- `command` - (required) command to run
- `args` - (required) arguments passed to the `command`.
  - `$PORT` will be replaced with the `port`.
  - `$DIR` will be replaced with the `directory`.
- `hostname` - (optional) a hostname by which you want to access the application.
  by default is the symlink name.
- `port` - (optional) a port on which the application will listen. By default
  auto assigned from the interval 5000-6000.
- `directory` - (optional) a directory in which the `command` will be run.
  By default is the directory to which the symlink is created.
- env - (optional) hash of additional environment variables. All current
  environment variables will be also available. Also $PORT and $DIR will be set.
- `watchFile` - (optional) touch this file and the application will be
  restarted on a next request. Relative to the `directory`.
- `logFile` - all `stdout` and `stderr` output will be redirect to this file.
  Relative to the `directory`.
- idleTimeout - (optional) number of seconds after which the application will be
  stopped after last request. By default - `10`. If you want not to stop server
  set it to `0`.

# Run

Start server:
```sh
$ bin/frontier start
```

The application will be available by address http://my-favorite-project.test
