
# Getting started

## At first you must require the logger.

    var logger = require("cinovo-logger");

## Append an Endpoint

There are many Endpoints:

* cinovo-logger-console
* cinovo-logger-syslog
* cinovo-logger-aws

You could also write your own Endpoint.

## How to use the logger

### debug

    logger.debug("myscript", "all values are ok");

or if you want to provide some metadata:

    logger.debug("myscript", "all values are ok", {a: 1, b: 2});

### info

    logger.info("myscript", "all values are ok", {a: 1, b: 2});

or if you want to provide some metadata:

    logger.info("myscript", "all values are ok", {a: 1, b: 2});

### error

    logger.error("myscript", "some values are not ok");
    logger.exception("myscript", "some values are not ok", new Error("values are not ok"));

or if you want to provide some metadata:

    logger.error("myscript", "some values are not ok", {a: 1, b: 2});
    logger.exception("myscript", "some values are not ok", new Error("values are not ok"));

### critical

    logger.critical("myscript", "all values are not ok");

or if you want to provide some metadata:

    logger.critical("myscript", "all values are not ok", {a: 1, b: 2});
