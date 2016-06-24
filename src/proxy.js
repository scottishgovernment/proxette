'use strict';

var http = require('http');
var net = require('net');
var url = require('url');

function Proxy (client, policy, router) {
    this.client = client;
    this.policy = policy;
    this.router = router;
}

Proxy.prototype.handleRequest = function (req, res) {
  req.on('error', function (err) {
      console.log('Request error:', err);
  });
  res.on('error', function (err) {
      console.log('Response error:', err);
  });

  var that = this;
  // Pause the stream to avoid buffering request before it is authenticated,
  // and the upstream connection is established.
  req.pause();
  var context = {
      url: req.url,
      method: req.method,
      headers: req.headers
  };
  var permittedRoles = that.policy(context);
  var allowAnonymous = !permittedRoles;

  this.client.authenticate(req.headers.authorization, function (auth) {
      if (!allowAnonymous && !auth.authenticated) {
          that.denied(req, res, auth, 401, 'Access denied');
      } else if (!allowAnonymous && !that.hasRequiredRole(auth.session, permittedRoles)) {
          that.denied(req, res, auth, 403, 'Permission denied');
      } else {
          that.proxyRequest(req, res, context, auth);
      }
  });
};

Proxy.prototype.hasRequiredRole = function (session, permittedRoles) {
    var roles = session.userResource.roles;
    for (var i = 0; i < roles.length; i++) {
        var role = roles[i];
        if (permittedRoles.indexOf(role.name) !== -1) {
            return true;
        }
    }
    return false;
};

Proxy.prototype.proxyRequest = function (req, res, context, auth) {
    var upstream = this.router(context);
    if (!upstream) {
        console.log(new Date().toString(), 'No upstream specified for ' + context.url);
        this.denied(req, res, auth, 400, 'No upstream specified');
    } else {
        upstream.headers = context.headers;
        upstream.method = context.method;
        upstream.agent = false;
        this.proxy(req, res, upstream, auth);
    }
};

Proxy.prototype.proxy = function (request, response, upstream, auth) {
    var that = this;
    var conn = http.request(upstream, function(resp) {
        resp.on('error', function (err) {
            that.logRequest(request, auth, 502);
            that.sendError(response, 502, err.toString());
        });
        that.logRequest(request, auth, resp.statusCode, resp.statusMessage);
        response.writeHeader(resp.statusCode, resp.headers);
        resp.pipe(response);
    });
    conn.on('error', function(err) {
        that.logRequest(request, auth, 502);
        that.sendError(response, 502, err.toString());
    });
    request.pipe(conn);
    request.resume();
};

Proxy.prototype.denied = function (req, res, auth, statusCode, message) {
    req.resume();
    this.logRequest(req, auth, statusCode);
    this.sendError(res, statusCode, message);
};

Proxy.prototype.logRequest = function (req, auth, statusCode) {
    var date = new Date().toString();
    var name = this.user(auth) || 'unknown';
    console.log(date, statusCode, req.url, '[' + name + ']');
};

Proxy.prototype.sendError = function (res, statusCode, message) {
    res.writeHead(statusCode, {'Content-Type': 'text/plain'});
    res.end(message);
};

Proxy.prototype.user = function (auth) {
    var user = auth.session && auth.session.userResource;
    return user && user.name;
};

Proxy.prototype.handler = function() {
    return this.handleRequest.bind(this);
};

function create(client, policy, router) {
    return new Proxy(client, policy, router);
}

module.exports = {
  create: create
};
