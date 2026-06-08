export function event(obj, event) {
    return new Promise((resolve) => {
        obj.addEventListener(event, resolve);
    });
}

export function entryExtensionStatus(pond, awaitedStatus, options) {
    const { entryId, extensionName } = options || {};
    return new Promise((resolve) => {
        const unsub = pond.on('updateEntry', (entry) => {
            // should filter on entryId
            if (entryId && entry.id !== entryId) {
                return;
            }

            // test if should filter on extensionName, else loop over all extensions
            const extensions = extensionName
                ? [entry.extensionState[extensionName]]
                : Object.values(entry.extensionState);
            const extension = extensions.find(
                (extension) => extension.status.code === awaitedStatus
            );

            if (!extension) {
                return;
            }

            unsub();
            resolve(extension);
        });
    });
}
