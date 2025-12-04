export function pubsub() {
    let subs: { event: string; callback: (...args: any[]) => void }[] = [];

    return {
        /** Subscribe to an event */
        on(event: string, callback: (detail?: any) => void): () => void {
            const scopedSub = { event, callback };

            subs.push(scopedSub);

            return () => {
                subs = subs.filter((sub) => sub !== scopedSub);
            };
        },

        /** Publish an event */
        pub(event: string, value?: any) {
            const relevantSubs = subs.filter((sub) => sub.event === event);

            for (const sub of relevantSubs) {
                // skip as may be unsubbed
                if (!subs.includes(sub)) {
                    continue;
                }

                // call!
                sub.callback(value);
            }
        },
    };
}
