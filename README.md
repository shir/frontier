Frontier is an application manager for development servers.
(Something like [pow](http://pow.cx))

**It's not production ready. Use on own risk**

Contribution is welcome.

# Motivation

[Pow](http://pow.cx), which I like very much, is out of date,
doesn't support HTTPS and is only for rack-based applications. I've used
[Invoker](http://invoker.codemancers.com) for some time but was not happy
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

# Generate certificate for HTTPS

If you want to use HTTPS and don't have warning in browsers about invalid
certificate you have to generate and install self signed certificate.

To generate certificate run command:
```sh
$ bin/frontier gencert
```
This command will generate certificate files in `~/.frontier` folder.
Run:
```sh
$ open ~/.frontier/frontier.crt
```
to open generated certificate in Keychain application. Certificate with
name "Frontier" will appear in "Certificates" category.
Double click on it and in appeared window expand "Trust" and change
"Secure Socket Layer (SSL)" option to "Always Trust". Now close certificate
window. You will be asked for your password to make changes. After you confirm
changes certificate will be valid in all browsers.

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
  "args":      ["in", "$DIR", "do", "bundle", "exec", "rails", "server", "-p", "$PORT", "-b", "$HOST"],
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

## Node.js with NVM

```json
{
  "command":   "~/.nvm/nvm-exec",
  "args":      ["npm", "run", "start"],
  "watchFile": "tmp/restart.txt"
}
```

## All available options:

- `command` - command to run. If not set then you have to start
  application manually. Frontier will work just as usual proxy. In this case
  you have to pass `port` option.
- `args` - arguments passed to the `command`.
  - `$HOST` will be replaced with the `hostname`.
  - `$PORT` will be replaced with the `port`.
  - `$DIR` will be replaced with the `directory`.
- `hostname` - (optional) a hostname by which you want to access the application.
  by default is the symlink name.
- `port` - (optional) a port on which the application will listen. By default
  auto assigned from the interval 5000-6000.
- `directory` - (optional) a directory in which the `command` will be run.
  By default is the directory to which the symlink is created.
- env - (optional) hash of additional environment variables. All current
  environment variables will be also available. Also `$HOST`, `$PORT` and
  `$DIR` will be set.
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

The application will be available by address http://my-favorite-project.dev.test
