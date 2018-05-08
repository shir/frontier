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

Create `.frontier.json` file in project folder with content:
```json
{
  "port":      5000,
  "command":   "rvm",
  "args":      ["in", "$DIR", "do", "bundle", "exec", "rails", "server", "-p", "$PORT"],
  "watchFile": "tmp/restart.txt"
}
```

# Run

Start server:
```sh
$ bin/frontier start
```

Project will be available by address http://my-favorite-project.test
