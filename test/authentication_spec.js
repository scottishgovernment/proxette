var auth = require('../target/src/authentication.js');
var http = require('http');
require('jasmine-beforeall');

describe('Authentication client', function() {

    // Mock authentication server
    var server;
    var endpoint;

    var client;

    /** Path of expected request to authentication. */
    var url;

    /** Response to return from mock authentication server. */
    var response;
    var statusCode;

    beforeEach(function() {
        client = new auth.AuthenticationClient(endpoint);
        response = undefined;
        statusCode = 0;
    });

    beforeAll(function() {
        server = http.createServer(function(req, res) {
            expect(req.url).toEqual(url);
            res.writeHead(statusCode, {'Content-Type': 'application/json'});
            res.end(response ? JSON.stringify(response, null, 2) : undefined);
        });
        server.listen();
        endpoint = 'http://localhost:' + server.address().port;
    });

    afterAll(function() {
        server.close();
    });

    it('returns the session if it is active', function (done) {
        url = '/token';
        statusCode = 200;
        response = {
            sessionAlive: true
        };
        client.authenticate('Bearer token', function (result) {
            expect(result.authenticated).toBe(true);
            expect(result.status).toBe(200);
            expect(result.session).toEqual(response);
            done();
        });
    });

    it('returns no error or session if not authenticated', function (done) {
        url = '/token';
        statusCode = 404;
        response = {
            id: 'Session not found'
        };
        client.authenticate('Bearer token', function (result) {
            expect(result.authenticated).toBe(false);
            expect(result.status).toBe(401);
            expect(result.session).toEqual(response);
            done();
        });
    });

    it('returns an error if authentication header is missing', function (done) {
        url = null;
        client.authenticate(null, function (result) {
            expect(result.authenticated).toBe(false);
            expect(result.status).toBe(401);
            expect(result.session).toBeUndefined();
            done();
        });
    });

    it('returns an error if authentication header is malformed', function (done) {
        url = null;
        client.authenticate('foobarbaz', function (err, session) {
            expect(err).toBeTruthy();
            expect(session).toBeUndefined();
            done();
        });
    });

});
