var router = require('../target/src/router.js');
var url = require('url');

describe('Router', function() {

    it('returns null if no upstream is specified', function() {
        var context = create('/', null);
        expect(result(context)).toBe(null);
    });

    it('passes through query string parameters', function() {
        var context = create('/feedback?a=1', 'http://localhost:8087');
        expect(result(context)).toBe('http://localhost:8087/feedback?a=1');
    });

    it('appends the request path to the upstream', function() {
        var context = create('/endpoint', 'http://localhost:8087/api');
        expect(result(context)).toBe('http://localhost:8087/api/endpoint');
    });

    it('defaults to http', function() {
        var context = create('/', 'localhost:8087');
        expect(result(context)).toBe('http://localhost:8087/');
    });

    function create(path, target) {
        return {
            url: path,
            method: 'GET',
            headers: {
                'x-proxy-target': target
            }
        };
    }

   function result(context) {
       var route = router(context);
       return route && url.format(route);
   }

});
