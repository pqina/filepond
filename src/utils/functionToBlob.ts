export default (fn: Function | string): Blob =>
    new Blob(['(', typeof fn === 'function' ? fn.toString() : fn, ')()'], {
        type: 'application/javascript',
    });
