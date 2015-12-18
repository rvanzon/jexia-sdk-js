import {expect} from 'chai';
import {assert} from 'chai';
import nock from 'nock';

import JexiaClient from '../src/JexiaClient.js';

/** @test {JexiaClient} */
describe('Class: JexiaClient', () => {

    it('should be constructed from one object param', (done) => {
        nock('http://foo.app.jexia.com')
            .post('/', { key: 'bar', secret: 'baz' }).reply(200, {
                token: 'T0K3N',
                refresh_token: 'REFTOKEN'
            });

        const client = new JexiaClient({
            appId: 'foo',
            appKey: 'bar',
            appSecret: 'baz',
        })
        .then(app => {
            assert.equal('foo', app.appId);
            assert.equal('bar', app.appKey);
            assert.equal('baz', app.appSecret);
            assert.equal('T0K3N', app.auth.getToken());
            assert.equal('REFTOKEN', app.auth.getRefreshToken());

            done();
        });
    });

    it('should be constructed from one object param with a valid token', (done) => {
        nock('http://foo.app.jexia.com')
            .post('/', { key: 'bar', secret: 'baz' }).reply(200, {
                token: 'T0K3N',
                refresh_token: 'REFTOKEN'
            });

        const client = new JexiaClient({
            appId: 'foo',
            appKey: 'bar',
            appSecret: 'baz',
        })
        .then(app => {
            assert.equal('foo', app.appId);
            assert.equal('bar', app.appKey);
            assert.equal('baz', app.appSecret);
            assert.equal('T0K3N', app.auth.getToken());
            assert.equal('REFTOKEN', app.auth.getRefreshToken());

            done();
        });
    });

    it('should not be constructed without params', () => {
        nock('http://foo.app.jexia.com')
            .post('/', { key: 'bar', secret: 'baz' }).reply(200, {
                token: 'T0K3N',
                refresh_token: 'REFTOKEN'
            });

        expect(() => {new JexiaClient()}).to.throw(Error);
    });

    it('should not be constructed with wrong params', () => {
        nock('http://foo.app.jexia.com')
            .post('/', { key: 'bar', secret: 'baz' }).reply(200, {
                token: 'T0K3N',
                refresh_token: 'REFTOKEN'
            });

        expect(() => {
            new JexiaClient({
                app: 'FOO',
                another: 'BAR',
                thing: 'BAZ'
            })
        }).to.throw(Error);
    });

});
