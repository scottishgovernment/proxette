'use strict';

/**
 * Returns the set of roles a user may have to make the given request.
 * The request object includes the following properties: url, method, headers.
 * Headers names are lower-case.
 */
function allowedRoles(request) {
    var headers = request.headers;
    var rolesText = headers['x-proxy-roles'];
    var roles = rolesText.split(/\s+/);
    return roles;
}

module.exports = allowedRoles;
