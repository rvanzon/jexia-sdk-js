import {assert} from 'chai';
import {expect} from 'chai';
import nock from 'nock';
import sinon from 'sinon';

import Bus from '../src/Bus.js';
import RealtimeClient from '../src/RealtimeClient.js';

/** @test {RealtimeClient} */
describe('Class: RealtimeClient', () => {
    let bus;

    beforeEach( () => {
        bus = Bus;
    });

    afterEach( () => {
        bus.removeAllListeners();
    });

    it('should be constructed', () => {
        let client = new RealtimeClient({
                url: 'http://rtc.jexia.com/rtc',
                token: 'bar',
                bus: bus
            });

        assert.equal('http://rtc.jexia.com/rtc', client.url);
        assert.equal('bar', client.token);
        assert.deepEqual(bus, client.bus);
    });

    it('should not be constructed without params', () => {
        expect(() => {new RealtimeClient()}).to.throw(Error);
    });

    it('should have faye attached', () => {
        let client = new RealtimeClient({
                url: 'http://rtc.jexia.com/rtc',
                token: 'bar',
                bus: bus
            });

        assert.ok(client.faye);
    });

    it('should have bus attached', () => {
        let client = new RealtimeClient({
                url: 'http://rtc.jexia.com/rtc',
                token: 'bar',
                bus: bus
            });

        assert.ok(client.bus);
    });

    it('should have a setToken method', () => {
        let client = new RealtimeClient({
                url: 'http://rtc.jexia.com/rtc',
                token: 'bar',
                bus: bus
            });

        client.setToken('foo');
        assert.equal('foo', client.token);
    });

    it('should have a getEventWithoutNamespace method', () => {
        let client = new RealtimeClient({
                url: 'http://rtc.jexia.com/rtc',
                token: 'bar',
                bus: bus
            });

        let event = client.getEventWithoutNamespace('TEST.foo');
        assert.equal('foo', event);
    });

    it('should have an attachEventHandlers method', () => {
        let client = new RealtimeClient({
                url: 'http://rtc.jexia.com/rtc',
                token: 'bar',
                bus: bus
            });

        expect(client.attachEventHandlers).to.be.a('function');
    });

    it('should have a onToken method', () => {
        let client = new RealtimeClient({
                url: 'http://rtc.jexia.com/rtc',
                token: 'bar',
                bus: bus
            });

        expect(client.onToken).to.be.a('function');
    });

    it('should have a onSubscription method', () => {
        let client = new RealtimeClient({
                url: 'http://rtc.jexia.com/rtc',
                token: 'bar',
                bus: bus
            });

        expect(client.onSubscription).to.be.a('function');
    });

    it('should have a curSubscrition property', () => {
        let client = new RealtimeClient({
                url: 'http://rtc.jexia.com/rtc',
                token: 'bar',
                bus: bus
            });

        client.curSubscription = 'SUBSCRIPTION';
        assert.equal('SUBSCRIPTION', client.curSubscription);
    });

    it('should be working when there is a new token from Auth', (done) => {
        let spy = sinon.spy(),
            client = new RealtimeClient({
                url: 'http://rtc.jexia.com/rtc',
                token: 'bar',
                bus: bus
            }),
            mock = {
               token: 'TOK3N',
               refreshToken: 'REFRESH_TOK3N'
           };

        bus.on('jexia.auth.token', spy);
        bus.emit('jexia.auth.token', mock);

        expect(spy.calledWith(mock)).to.be.true;
        expect(spy.calledOnce).to.be.true;
        expect(spy.callCount).to.equal(1);

        done();
    });

    it('should be working when there is a new subscription from Dataset', (done) => {
        let spy = sinon.spy(),
            client = new RealtimeClient({
                url: 'http://rtc.jexia.com/rtc',
                token: 'bar',
                bus: bus
            }),
            mock = {
               app: 'foo',
               dataset: 'DATASET',
               event: 'DATASET.*'
           };

        bus.on('jexia.dataset.subscription', spy);
        bus.emit('jexia.dataset.subscription', mock);

        expect(spy.calledWith(mock)).to.be.true;
        expect(spy.calledOnce).to.be.true;
        expect(spy.callCount).to.equal(1);

        done();
    });

});
