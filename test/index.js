import {assert} from 'chai';
import {expect} from 'chai';
import nock from 'nock';
import sinon from 'sinon';

import {JexiaClient} from '../src/index.js';

describe('Jexia Client Consumer', () => {

    it('should list all records of a dataset', (done) => {
        nock('http://foo.app.jexia.com')
            .post('/', { key: 'bar', secret: 'baz' })
            .reply(200, {
                token: 'T0K3N',
                refresh_token: 'REFTOKEN'
            })
            .get('/messages/')
            .reply(200, []);

        // Return is important here for proper done()
        return new JexiaClient({
            appId: 'foo',
            appKey: 'bar',
            appSecret: 'baz',
        })
        .then(function(app) {
            // Return is important here for proper done()
            return app.dataset('messages').list().then( (messages) => {
                expect(messages).to.eql([]);
                done();
            });
        });
    });

    it('should create a record on dataset', (done) => {
        nock('http://foo.app.jexia.com')
            .post('/', { key: 'bar', secret: 'baz' })
            .reply(200, {
                token: 'T0K3N',
                refresh_token: 'REFTOKEN'
            })
            .post('/messages/')
            .reply(201, {
                value: 'TEST TEST TEST',
                createdAt: '2015-12-08T22:40:50.785Z',
                updatedAt: '2015-12-09T00:45:45.883Z',
                id: '56675c7283b31aa5d8c5bfb9'
            });

        // Return is important here for proper done()
        return new JexiaClient({
            appId: 'foo',
            appKey: 'bar',
            appSecret: 'baz'
        })
        .then(function(app) {
            // Return is important here for proper done()
            return app.dataset('messages').create({
                value: 'TEST TEST TEST'
            }).then( (message) => {
                assert.equal(message.value, 'TEST TEST TEST');

                done();
            });
        });
    });

    it('should delete a record on dataset', (done) => {
        nock('http://foo.app.jexia.com')
            .post('/', { key: 'bar', secret: 'baz' })
            .reply(200, {
                token: 'T0K3N',
                refresh_token: 'REFTOKEN'
            })
            .delete('/messages/' + '56675c7283b31aa5d8c5bfb9')
            .reply(200, {
                value: 'TEST TEST TEST',
                createdAt: '2015-12-08T22:40:50.785Z',
                updatedAt: '2015-12-09T00:45:45.883Z',
                id: '56675c7283b31aa5d8c5bfb9'
            });

        // Return is important here for proper done()
        return new JexiaClient({
            appId: 'foo',
            appKey: 'bar',
            appSecret: 'baz'
        })
        .then(function(app) {
            // Return is important here for proper done()
            return app.dataset('messages')
                .delete('56675c7283b31aa5d8c5bfb9')
                .then( (message) => {
                    assert.equal(message.id, '56675c7283b31aa5d8c5bfb9');
                    done();
                });
        });
    });

    it('should update a record on dataset', (done) => {
        nock('http://foo.app.jexia.com')
            .post('/', { key: 'bar', secret: 'baz' })
            .reply(200, {
                token: 'T0K3N',
                refresh_token: 'REFTOKEN'
            })
            .put('/messages/' + '56675c7283b31aa5d8c5bfb9')
            .reply(200, {
                value: 'FooBAZ',
                createdAt: '2015-12-08T22:40:50.785Z',
                updatedAt: '2015-12-09T00:45:45.883Z',
                id: '56675c7283b31aa5d8c5bfb9'
            });

        // Return is important here for proper done()
        return new JexiaClient({
            appId: 'foo',
            appKey: 'bar',
            appSecret: 'baz'
        })
        .then(function(app) {
            // Return is important here for proper done()
            return app.dataset('messages')
                .update('56675c7283b31aa5d8c5bfb9', {
                    value: 'FooBAZ'
                })
                .then( (message) => {
                    assert.equal(message.id, '56675c7283b31aa5d8c5bfb9');
                    assert.equal(message.value, 'FooBAZ');
                    done();
                });
        });
    });

    it('should have an event bus attached', (done) => {
        let spy = sinon.spy();

        nock('http://foo.app.jexia.com')
            .post('/', { key: 'bar', secret: 'baz' })
            .reply(200, {
                token: 'T0K3N',
                refresh_token: 'REFTOKEN'
            })
            .get('/messages/')
            .reply(200, []);

        // Return is important here for proper done()
        return new JexiaClient({
            appId: 'foo',
            appKey: 'bar',
            appSecret: 'baz',
        })
        .then(function(app) {
            let bus = app.dataset('DATASET').bus;
            expect(bus).to.be.ok;
            done();
        });
    });

    it('should listen for all events', (done) => {
        let spy = sinon.spy();

        nock('http://foo.app.jexia.com')
            .post('/', { key: 'bar', secret: 'baz' })
            .reply(200, {
                token: 'T0K3N',
                refresh_token: 'REFTOKEN'
            })
            .get('/messages/')
            .reply(200, []);

        // Return is important here for proper done()
        return new JexiaClient({
            appId: 'foo',
            appKey: 'bar',
            appSecret: 'baz',
        })
        .then(function(app) {
            let bus = app.dataset('DATASET').bus,
                mock = {
                    "message": "1234",
    	            "createdAt": "2015-12-14T10:25:28.538Z",
                    "updatedAt": "2015-12-14T10:25:28.538Z",
                    "id": "566e99184b3b174af6511a60"
                };

            bus.on('*', spy);
            bus.emit('*', mock);

            expect(spy.calledWith(mock)).to.be.true;
            expect(spy.calledOnce).to.be.true;
            expect(spy.callCount).to.equal(1);

            bus.removeAllListeners();

            done();
        });
    });

    it('should listen only create events', (done) => {
        let spy = sinon.spy();

        nock('http://foo.app.jexia.com')
            .post('/', { key: 'bar', secret: 'baz' })
            .reply(200, {
                token: 'T0K3N',
                refresh_token: 'REFTOKEN'
            })
            .get('/messages/')
            .reply(200, []);

        // Return is important here for proper done()
        return new JexiaClient({
            appId: 'foo',
            appKey: 'bar',
            appSecret: 'baz',
        })
        .then(function(app) {
            let bus = app.dataset('DATASET').bus,
                mock = {
                    "message": "1234",
    	            "createdAt": "2015-12-14T10:25:28.538Z",
                    "updatedAt": "2015-12-14T10:25:28.538Z",
                    "id": "566e99184b3b174af6511a60"
                };

            bus.on('created', spy);
            bus.emit('created', mock);

            expect(spy.calledWith(mock)).to.be.true;
            expect(spy.calledOnce).to.be.true;
            expect(spy.callCount).to.equal(1);

            bus.removeAllListeners();

            done();
        });
    });

    it('should listen only update events', (done) => {
        let spy = sinon.spy();

        nock('http://foo.app.jexia.com')
            .post('/', { key: 'bar', secret: 'baz' })
            .reply(200, {
                token: 'T0K3N',
                refresh_token: 'REFTOKEN'
            })
            .get('/messages/')
            .reply(200, []);

        // Return is important here for proper done()
        return new JexiaClient({
            appId: 'foo',
            appKey: 'bar',
            appSecret: 'baz',
        })
        .then(function(app) {
            let bus = app.dataset('DATASET').bus,
                mock = {
                    "message": "1234",
    	            "createdAt": "2015-12-14T10:25:28.538Z",
                    "updatedAt": "2015-12-14T10:25:28.538Z",
                    "id": "566e99184b3b174af6511a60"
                };

            bus.on('updated', spy);
            bus.emit('updated', mock);

            expect(spy.calledWith(mock)).to.be.true;
            expect(spy.calledOnce).to.be.true;
            expect(spy.callCount).to.equal(1);

            bus.removeAllListeners();

            done();
        });
    });

    it('should listen only delete events', (done) => {
        let spy = sinon.spy();

        nock('http://foo.app.jexia.com')
            .post('/', { key: 'bar', secret: 'baz' })
            .reply(200, {
                token: 'T0K3N',
                refresh_token: 'REFTOKEN'
            })
            .get('/messages/')
            .reply(200, []);

        // Return is important here for proper done()
        return new JexiaClient({
            appId: 'foo',
            appKey: 'bar',
            appSecret: 'baz',
        })
        .then(function(app) {
            let bus = app.dataset('DATASET').bus,
                mock = {
                    "message": "1234",
    	            "createdAt": "2015-12-14T10:25:28.538Z",
                    "updatedAt": "2015-12-14T10:25:28.538Z",
                    "id": "566e99184b3b174af6511a60"
                };

            bus.on('deleted', spy);
            bus.emit('deleted', mock);

            expect(spy.calledWith(mock)).to.be.true;
            expect(spy.calledOnce).to.be.true;
            expect(spy.callCount).to.equal(1);

            bus.removeAllListeners();

            done();
        });
    });

    it('should have a functional subscribe method on dataset', (done) => {
        let spy = sinon.spy();

        nock('http://foo.app.jexia.com')
            .post('/', { key: 'bar', secret: 'baz' })
            .reply(200, {
                token: 'T0K3N',
                refresh_token: 'REFTOKEN'
            })
            .get('/messages/')
            .reply(200, []);

        // Return is important here for proper done()
        return new JexiaClient({
            appId: 'foo',
            appKey: 'bar',
            appSecret: 'baz',
        })
        .then(function(app) {
            let dataset = app.dataset('DATASET'),
                bus = app.dataset('DATASET').bus,
                mock = {
                    "message": "1234",
    	            "createdAt": "2015-12-14T10:25:28.538Z",
                    "updatedAt": "2015-12-14T10:25:28.538Z",
                    "id": "566e99184b3b174af6511a60"
                };

            dataset.subscribe('*', spy);
            bus.emit(dataset.getEventNamespace('*'), mock);

            expect(spy.calledWith(mock)).to.be.true;
            expect(spy.calledOnce).to.be.true;
            expect(spy.callCount).to.equal(1);

            bus.removeAllListeners();

            done();
        });
    });

    it('should have a functional unsubscribe method on dataset', (done) => {
        let spy = sinon.spy();

        nock('http://foo.app.jexia.com')
            .post('/', { key: 'bar', secret: 'baz' })
            .reply(200, {
                token: 'T0K3N',
                refresh_token: 'REFTOKEN'
            })
            .get('/messages/')
            .reply(200, []);

        // Return is important here for proper done()
        return new JexiaClient({
            appId: 'foo',
            appKey: 'bar',
            appSecret: 'baz',
        })
        .then(function(app) {
            let dataset = app.dataset('DATASET'),
                bus = app.dataset('DATASET').bus,
                mock = {
                    "message": "1234",
    	            "createdAt": "2015-12-14T10:25:28.538Z",
                    "updatedAt": "2015-12-14T10:25:28.538Z",
                    "id": "566e99184b3b174af6511a60"
                };

            dataset.subscribe('*', spy);
            bus.emit(dataset.getEventNamespace('*'), mock);

            expect(spy.calledWith(mock)).to.be.true;
            expect(spy.calledOnce).to.be.true;
            expect(spy.callCount).to.equal(1);

            dataset.unsubscribe('*', spy);
            bus.emit(dataset.getEventNamespace('*'), mock);

            expect(spy.calledOnce).to.be.true;
            expect(spy.callCount).to.equal(1);

            bus.removeAllListeners();

            done();
        });
    });

    it('should get information about a dataset', (done) => {
        nock('http://foo.app.jexia.com')
            .post('/', { key: 'bar', secret: 'baz' })
            .reply(200, {
                token: 'T0K3N',
                refresh_token: 'REFTOKEN'
            })
            .get('/messages/')
            .query({
                jexia_info: true
            })
            .reply(200, {
                info: {
                    count: 50,
                    criteria: {},
                    end: 50,
                    start: 0,
                    total: 339
                }
            });

        // Return is important here for proper done()
        return new JexiaClient({
            appId: 'foo',
            appKey: 'bar',
            appSecret: 'baz',
        })
        .then(function(app) {
            // Return is important here for proper done()
            return app.dataset('messages').info()
                .then( (info) => {
                    assert.isDefined(info);
                    assert.equal(info.total, 339);

                    done();
            });
        });
    });

    it('should pass query params on dataset', (done) => {
        let mock = [
            {
                "message": "Message 1",
                "createdAt": "2015-12-14T10:25:28.538Z",
                "updatedAt": "2015-12-14T10:25:28.538Z",
                "id": "566e99184b3b174af6511a60"
            },
            {
                "message": "Message 2",
                "createdAt": "2015-12-14T11:25:28.538Z",
                "updatedAt": "2015-12-14T11:25:28.538Z",
                "id": "566e99184b3b174af6511a61"
            }
        ];

        nock('http://foo.app.jexia.com')
            .post('/', { key: 'bar', secret: 'baz' })
            .reply(200, {
                token: 'T0K3N',
                refresh_token: 'REFTOKEN'
            })
            .get('/messages/')
            .query({
                limit: 2
            })
            .reply(200, mock);

        // Return is important here for proper done()
        return new JexiaClient({
            appId: 'foo',
            appKey: 'bar',
            appSecret: 'baz',
        })
        .then(function(app) {
            // Return is important here for proper done()
            return app.dataset('messages').query({
                limit: 2
            })
            .then( (res) => {
                expect(res).to.have.length(2);

                done();
            });
        });
    });

});
