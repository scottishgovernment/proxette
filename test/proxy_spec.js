var proxy = require('../target/src/proxy.js');
var url = require('url');

describe('Proxy', function() {

    var client;
    var policy;
    var router;
    var sut;
    var req;
    var res;
    var auth;

    beforeEach(function() {
        client = jasmine.createSpyObj('client', ['authenticate']);
        policy = jasmine.createSpy('policy');
        router = jasmine.createSpy('router');
        router.andReturn(url.parse('http://localhost:9999'));
        policy.andReturn(['admin']);
        client.authenticate.andCallFake(function (token, callback) {
            callback(auth);
        });
        req = jasmine.createSpyObj('request', [ 'pause', 'pipe', 'resume' ]);
        req.headers = {};
        res = jasmine.createSpyObj('response', [ 'pipe', 'writeHead', 'end' ]);
        sut = proxy.create(client, policy, router);
        spyOn(sut, 'proxy');
    });

    it('returns 400 if not upstream header not specified', function() {
        router.andReturn(null);
        auth = createSessionAuth(true, [ 'admin' ]);
        sut.handleRequest(req, res);
        expectStatus(400);
    });

    it('returns 401 if not authenticated', function() {
        auth = createNoSessionAuth();
        sut.handleRequest(req, res);
        expectStatus(401);
    });

    it('returns 401 if not authenticated', function () {
        auth = createNoSessionAuth();
        sut.handleRequest(req, res);
        expectStatus(401);
        expect(sut.proxy).not.toHaveBeenCalled();
    });

    it('returns 401 if session not valid', function () {
        auth = createSessionAuth(false, [ 'admin' ]);
        sut.handleRequest(req, res);
        expectStatus(401);
    });

    it('returns 403 if user does not have the required role', function () {
        auth = createSessionAuth(true, [ 'user' ]);
        sut.handleRequest(req, res);
        expectStatus(403);
    });

    it('proxies a request if the user has the required role', function () {
        auth = createSessionAuth(true, [ 'admin' ]);
        sut.handleRequest(req, res);
        expect(sut.proxy).toHaveBeenCalled();
    });

    it('proxies a request if not authenticated and anonymous access is allowed', function () {
        auth = createNoSessionAuth();
        policy.andReturn(null);
        sut.handleRequest(req, res);
        expect(sut.proxy).toHaveBeenCalled();
    });

    it('proxies a request if anonymous access is allowed but authenticated anyway', function () {
        auth = createSessionAuth(true, [ 'admin' ]);
        policy.andReturn(null);
        sut.handleRequest(req, res);
        expect(sut.proxy).toHaveBeenCalled();
    });

    function expectStatus(code) {
        expect(sut.proxy).not.toHaveBeenCalled();
        expect(res.writeHead.callCount).toBe(1);
        expect(res.writeHead.calls[0].args[0]).toBe(code);
    }

    function createNoSessionAuth () {
        return {
            authenticated: false
        };
    }

    function createSessionAuth (valid, roles) {
        var session = {
            sessionId: 'f832ab8b-0995-486d-80ae-cd82534d11b4',
            sessionAlive: valid,
            userResource: {
                userId: '4ecc83e0-8209-11e4-b4a9-0800200c9a66',
                name: 'user@mygov.scot',
                email: null,
                active: true,
                roles: []
            },
            dateTimeStarted: '2016-06-21T15:58:47Z',
            inactivityEndDateTime: '2016-06-21T18:37:49Z',
        };
        for (var i = 0; i < roles.length; i++) {
            session.userResource.roles[i] = {
                roleId: i.toString(),
                name: roles[i],
                description: '',
                active: true
            };
        }
        var auth = {
            authenticated: valid,
            session: session
        };
        return auth;
    }
});
