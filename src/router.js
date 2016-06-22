'use strict';

var url = require('url');
var path = require('path');

/**
 * Returns the upstream host to which a request should be proxied.
 * The request object includes the following properties: url, method, headers.
 * Headers names are lower-case.
 */
function route(request) {
    var target = request.headers['x-proxy-target'];
    if (!target) {
        console.log('No upstream specified in request to ' + request.url);
        return null;
    }
    if (target.indexOf('://') === -1) {
        target = 'http://' + target;
    }
    var tgt = url.parse(target);
    var uri = url.parse(request.url);
    uri.protocol = tgt.protocol;
    uri.hostname = tgt.hostname;
    uri.port = tgt.port;
    uri.pathname = path.join(tgt.pathname || '/', uri.pathname);
    return uri;
}

module.exports = route;
