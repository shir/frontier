Frontier is an application manager for development servers.
(Something like [pow](http://pow.cx))

**It's not ready to use application. Just started development! Don't use it!**

Contribution is welcome.

# Motivation

[Pow](http://pow.cx), which I like very much, is out of date,
doesn't support HTTPS and is only for rack-based applications. I've used
[Invoker](http://invoker.codemancers.com) for some time but is not happy
with it. And looks like it's abandoned too.

# TODO

* Add install/uninstall script
  * Configure firewall to redirect everything on port 80 and 443 to
    Frontier
  * Configure resolver to use Frontier for '.test' domain
* Add Frontier management console utility (start/stop/reload)
* Add ability to add/remove application with console utility
* Move application configuration to application's root folder
* Add many processes per application
* Add Frontier configuration
