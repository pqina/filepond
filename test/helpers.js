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
                ? [entry.extension[extensionName]]
                : Object.values(entry.extension);
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

// simulate drag action
export async function dragSimulation(path, options) {
    const {
        wait = 500,
        shouldRelease = true,
        shouldLoop = false,
        shouldLog = false,
        shouldClearConsole = false,
        elementFromPoint = (type, x, y) => document.elementFromPoint(x, y),
    } = options || {};

    // so we only clear once
    let didClearConsole = false;

    // we remember last point so we can fire pointerup when we're done
    const step = async (items) => {
        let lastPoint;
        for (const [index, point] of items.entries()) {
            let ts = point.wait || wait;
            await sleep(ts);
            if (shouldClearConsole && !didClearConsole) {
                console.clear();
                didClearConsole = true;
            }
            const type = index === 0 ? 'pointerdown' : 'pointermove';
            if (shouldLog) {
                console.info(`🖱️ ${type}: `, index, { ...point });
            }
            dispatchPointerEvent(point, type, elementFromPoint);
            lastPoint = point;
        }
        return lastPoint;
    };

    // loop through points
    let lastPoint;
    if (shouldLoop) {
        while (true) {
            await step(path);
        }
    } else {
        lastPoint = await step(path);
    }

    // exit if should not drop
    if (!shouldRelease && lastPoint) return;

    // wait at end
    await sleep(wait);

    // fire pointerup on last event
    dispatchPointerEvent(lastPoint, 'pointerup', elementFromPoint);
}

// helper to wait for x milliseconds
const sleep = (time) =>
    new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, time);
    });

// helper to dispatch pointer events
const dispatchPointerEvent = (point, type, elementFromPoint) => {
    elementFromPoint(type, point.x, point.y).dispatchEvent(
        new PointerEvent(type, {
            clientX: point.x,
            clientY: point.y,
            bubbles: true,
        })
    );
};
