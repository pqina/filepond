import { getUniqueId } from './getUniqueId';

export const createWorker = fn => {
    const workerBlob = new Blob(['(', fn.toString(), ')()'], {
        type: 'application/javascript'
    });
    const workerURL = URL.createObjectURL(workerBlob);
    const worker = new Worker(workerURL);

    return {
        transfer: (message, cb) => {},
        post: (message, cb, transferList) => {
            const id = getUniqueId();

            worker.onmessage = e => {
                if (e.data.id === id) {
                    cb(e.data.message);
                }
            };

            worker.postMessage(
                {
                    id,
                    message
                },
                transferList
            );
        },
        terminate: () => {
            worker.terminate();
            URL.revokeObjectURL(workerURL);
        }
    };
};
