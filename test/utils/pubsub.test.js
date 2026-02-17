import { it, describe, expect, beforeEach } from 'vitest';
import { pubsub } from '../../src/utils/pubsub.js';

describe('pubsub', () => {
    let bus;

    beforeEach(() => {
        bus = pubsub();
    });

    it('should return unsub', () => {
        const unsub = bus.on('test', () => {
            // empty
        });

        expect(unsub).to.not.be.undefined;
    });

    it('should pub', () =>
        new Promise((done) => {
            let pubbed = false;
            bus.on('test', () => {
                pubbed = true;
                expect(pubbed).to.be.true;
                done();
            });

            bus.pub('test');
        }));

    it('should unsub', () => {
        let called = false;
        const unsub = bus.on('test', () => {
            called = true;
        });

        unsub();

        bus.pub('test');

        expect(called).to.be.false;
    });
});
