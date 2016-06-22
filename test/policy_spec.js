var policy = require('../target/src/policy.js');

describe('Policy', function() {

    it('allows a single role to be specified', function() {
        expect(result('admin')).toEqual([ 'admin' ]);
    });

    it('allows multiple roles to be specified', function() {
        expect(result('admin editor')).toEqual([ 'admin', 'editor' ]);
    });

    it('ignores whitespace', function() {
        expect(result('admin   editor')).toEqual([ 'admin', 'editor' ]);
    });

    function result(roles) {
        return policy({
            url: '/',
            method: 'GET',
            headers: {
                'x-proxy-roles': roles
            }
        });
    }

});
