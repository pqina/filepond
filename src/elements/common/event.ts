export function once(fn: any) {
    return function (event: Event) {
        if (fn) {
            // @ts-ignore
            fn.call(this, event);
        }
        fn = null;
    };
}
