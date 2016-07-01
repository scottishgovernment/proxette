'use strict';

var path = require('path');
var url = require('url');

/**
 * Authentication system client.
 */
function AuthenticationClient(endpoint) {
    this.endpoint = endpoint;
    this.rest = require('restler');
}

AuthenticationClient.prototype.authenticate = function (authorization, callback) {
    var that = this;
    var token = this.getToken(authorization);
    if (!token) {
        callback({
          authenticated: false,
          status: 401,
          msg: 'No authentication token'
        });
        return;
    }

    this.getSession(token, function(err, result) {
        if (err) {
          callback({
            authenticated: false,
            status: 500,
            msg: err
          });
          return;
        }

        var authenticated = result.ok && that.validateSession(result.session);
        var status = authenticated ? 200 : 401;
        callback({
            authenticated: authenticated,
            status: status,
            session: result.session
        });
    });
};

AuthenticationClient.prototype.getToken = function (authorization) {
    if (!authorization
            || authorization.length <= 7
            || authorization.substr(0, 7) !== 'Bearer ') {
        return null;
    }
    return authorization.substr(7);
};

AuthenticationClient.prototype.getSession = function (token, callback) {
    var uri = url.parse(this.endpoint);
    uri.pathname = path.join(uri.pathname, token);
    uri = url.format(uri);
    var json = this.rest.get(uri, {
        headers: {
            'Accept': 'application/json',
            'User-Agent': 'Publish Trigger'
        }
    });
    json.on('complete', function (data, response) {
        if (data instanceof Error) {
            console.log('Failed to validate session ', token, ': ', data);
            var err = (data && data.id) || data || 'Error';
            callback(err);
        } else {
            callback(null, {
                ok: response.statusCode === 200,
                session: data
            });
        }
    });
};

AuthenticationClient.prototype.validateSession = function (session) {
    return session && session.sessionAlive;
};

module.exports = {
    AuthenticationClient: AuthenticationClient
};
