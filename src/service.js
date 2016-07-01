'use strict';

/**
 * Proxette service.
 * This class wires together the components that implement the service,
 * and starts the HTTP server.
 */
function Service(config) {
    this.config = config;
}

Service.prototype.run = function() {
  var AuthenticationClient = require('./authentication').AuthenticationClient;
  var client = new AuthenticationClient(this.config.authentication.endpoint);

  var http = require('http');
  var policy = require('./policy');
  var router = require('./router');
  var proxy = require('./http_proxy');

  var proxyApp = proxy.create(client, policy, router);
  var server = http.createServer();
  server.on('request', proxyApp.handler());
  server.listen(this.config.port);
};

function create(config) {
    return new Service(config);
}

module.exports = {
    create: create
};
