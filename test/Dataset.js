import {assert} from 'chai';
import {expect} from 'chai';
import nock from 'nock';

import Dataset from '../src/Dataset.js';

/** @test {Dataset} */
describe('Class: Dataset', () => {

    it('should be constructed from one object param', () => {
        let dataset = new Dataset('DATASET', {});

        assert.equal(dataset.name, 'DATASET');
    });

    it('should not be constructed without params', () => {
        expect(Dataset).to.throw();
    });

    it('should throw an error on request without params', () => {
        let dataset = new Dataset('DATASET', {});
        expect(dataset.request).to.throw();
    });

    it('should throw an error on subscribe without params', () => {
        let dataset = new Dataset('DATASET', {});
        expect(dataset.subscribe).to.throw();
    });

});
