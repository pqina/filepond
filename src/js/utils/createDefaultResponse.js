import { createResponse } from './createResponse';

export const createTimeoutResponse = (cb) => (xhr) => {
    cb(
        createResponse(
            'error',
            0,
            'Timeout',
            xhr.getAllResponseHeaders()
        )
    )
}