import {assert} from 'chai';
import {expect} from 'chai';
import nock from 'nock';

import Auth from '../src/Auth.js';

/** @test {Auth} */
describe('Class: Auth', () => {

    it('should be constructed from one object param', () => {
        let auth = new Auth({
            url: 'http://' + 'foo' + '.app.jexia.com/',
            key: 'bar',
            secret: 'baz',
            client: {
                bus: {}
            }
        });

        assert.equal(auth.url, 'http://foo.app.jexia.com/');
        assert.equal(auth.key, 'bar');
        assert.equal(auth.secret, 'baz');
    });

    it('should not be constructed without params', () => {
        expect(() => {new Auth()}).to.throw(Error);
    });
    
});
