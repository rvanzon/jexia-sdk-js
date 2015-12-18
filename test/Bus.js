import {expect} from 'chai';
import nock from 'nock';

import Bus from '../src/Bus.js';

/** @test {Bus} */
describe('Class: Bus', () => {

    it('should be defined', () => {
        let bus = Bus;
        expect(bus).to.be.ok;
    });
    
});
