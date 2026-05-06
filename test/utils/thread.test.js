import { it, describe, expect } from 'vitest';
import { thread } from '../../src/utils/thread.js';

describe('thread', function () {
    it('should reject with signal reason when already aborted', async () => {
        const controller = new AbortController();
        const reason = 'Aborted';

        controller.abort(reason);

        try {
            await thread(() => {}, [], { signal: controller.signal });
            throw new Error('Expected thread to reject');
        } catch (error) {
            expect(error).to.equal(reason);
        }
    });

    it('should reject with signal reason when aborted while running', async () => {
        const controller = new AbortController();
        const reason = 'Aborted';

        const promise = thread(
            function (done) {
                setTimeout(() => {
                    done(null, 'Done');
                }, 1000);
            },
            [],
            { signal: controller.signal }
        );

        controller.abort(reason);

        try {
            await promise;
            throw new Error('Expected thread to reject');
        } catch (error) {
            expect(error).to.equal(reason);
        }
    });
});
