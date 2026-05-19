import { createExtension } from './common/createExtension.js';
import { bytesToNaturalFileSize } from '../utils/file.js';
import { isDirectoryEntry, isNumber } from '../utils/test.js';
import { Status } from '../common/status.js';
import { clamp } from '../utils/math.js';
import { arrayRemoveFalsy } from '../utils/array.js';
import { clear, log } from '../common/console.js';
import type { FilePondEntry, FilePondDirectoryEntry } from '../types/index.js';
import type { ExtensionState, ExtensionStatus } from './common/createExtension.js';
import { toSpaceSeparatedString } from '../elements/common/string.js';

export interface ConsoleViewOptions {
    /** Clear console before logging, defaults to `false` */
    clearBeforeLog?: boolean;

    /** Debounce the log call from the 'updateEntries' event, defaults to `true` */
    debounce?: boolean;
}
// this counts public pond instances
let pondCounter = 0;

export const ConsoleView = createExtension({
    name: 'ConsoleView',
    type: 'view',
    props: {
        clearBeforeLog: false,
        debounce: true,
    } as ConsoleViewOptions,
    factory: ({ props, extensionName }, pond) => {
        // shortcuts to filepond internal methods
        const { on, insertEntries, updateEntry, removeEntries } = pond;

        /** Clean an object for use with structuredCLone */
        function cleanStructuredClone(obj: any, seen = new WeakSet()): any {
            // ignore simple values
            if (obj === null || typeof obj !== 'object') {
                return obj;
            }

            // prevent circular references
            if (seen.has(obj)) {
                return null;
            }

            // mark as seen
            seen.add(obj);

            // loop over arrays
            if (Array.isArray(obj)) {
                return obj.map((item) => cleanStructuredClone(item, seen));
            }

            // clone!
            try {
                return structuredClone(obj);
            } catch (err) {
                // copy error values
                if (/Error/.test(obj.constructor.name)) {
                    return {
                        code: obj.code,
                        message: obj.message,
                    };
                }

                /** Try To copy prop values */
                let res: { [key: string]: any } = {};
                for (const [key, value] of Object.entries(obj)) {
                    res[key] = cleanStructuredClone(value);
                }
                return res;
            }
        }

        /** We try to clone the entry so we can see a snapshot in the console */
        function cloneEntry(entry: FilePondEntry) {
            // return structuredClone(entry);
            return cleanStructuredClone(entry);
        }

        function getProgressLabel(progress: number | null | undefined) {
            if (!isNumber(progress)) {
                return;
            }

            if (progress === Infinity) {
                return '∞ busy';
            }

            const progressLimited = clamp(progress);
            const t = 15;
            const s = Math.round(progressLimited * t);
            return (
                '█'.repeat(s) + '░'.repeat(t - s) + ' ' + Math.round(progressLimited * 100) + '%'
            );
        }

        function hasStatus(
            value: any,
            index: number,
            arr: any[]
        ): value is ExtensionState & { status: ExtensionStatus } {
            return !!value.status;
        }

        function logEntry(entry: FilePondEntry, prefix: string, label: string, info = '') {
            let textColor = 'inherit';

            const extensions = arrayRemoveFalsy(Object.values(entry.extension ?? {}));

            const labels = extensions
                .filter(hasStatus)
                .map(({ status }) => {
                    let labels = [];
                    let color = textColor;
                    let post = '';
                    let symbol = '';

                    if (status.type === Status.Warning) {
                        symbol = '▲';
                        color = 'Orange';
                    }

                    if (status.type === Status.Error) {
                        symbol = '✖︎';
                        color = 'OrangeRed';
                    }

                    if (status.type === Status.Success) {
                        symbol = '✔';
                        color = 'YellowGreen';
                    }

                    if (status.type === Status.Info) {
                        symbol = 'i';
                        color = 'SkyBlue';
                    }

                    if (status.type === Status.System) {
                        if (status.code.includes('BUSY')) {
                            symbol = '⧗';
                            post = ` ${getProgressLabel(status.progress)}`;
                        } else if (status.code.includes('COMPLETE')) {
                            symbol = '✔';
                        } else {
                            symbol = '•';
                        }

                        color = 'Grey';
                    }

                    labels.push({ label: `${symbol} ${status.code}${post}`, color });

                    return labels;
                })
                .flat();

            let str = `%c%s %o\t  %c${prefix}%c${label}%c${info} ${toSpaceSeparatedString(
                ...labels.map(({ label }) => `%c ${label}`)
            )}`;

            // pad string
            str += ' '.repeat(Math.max(0, 60 - str.length)) + '';

            // draw log entry
            log(
                ...arrayRemoveFalsy([
                    str,
                    'color:grey',
                    entry.id,
                    { '🔍': cloneEntry(entry) },
                    'color:grey',
                    'color:' + textColor,
                    'color:grey',
                    ...labels.flat().map(({ color }) => `color:${color}`),
                ])
            );
        }

        function logFile(entry: FilePondEntry, prefix: string) {
            logEntry(
                entry,
                prefix,
                entry.name ?? entry?.state.src ?? '',
                // @ts-ignore
                'size' in entry ? ` (${bytesToNaturalFileSize(entry.size)})` : ''
            );
        }

        function logDirectory(entry: FilePondDirectoryEntry, prefix: string) {
            logEntry(entry, prefix, entry.name + '/');
        }

        function logEntries(entries: FilePondEntry[], level: number, branch: string[]) {
            entries.forEach((entry, index) => {
                let prefix = '';

                const isLast = index === entries.length - 1;

                let currentBranch = [...branch];

                if (level > 0) {
                    prefix = (isLast ? '└──' : '├──') + ' ';
                }

                if (isDirectoryEntry(entry)) {
                    logDirectory(entry, currentBranch.join('') + prefix);

                    if (level > 0) currentBranch.push(isLast ? '    ' : '│   ');

                    return logEntries(entry.entries, level + 1, currentBranch);
                }

                logFile(entry, currentBranch.join('') + prefix);
            });
        }

        let frame: number;

        function handleUpdateEntries(entries: FilePondEntry[]) {
            const { debounce, clearBeforeLog } = props;

            const logEntriesUpdate = () => {
                // clears console before logging updating
                if (clearBeforeLog) {
                    clear();
                }

                if (entries.length > 1 || clearBeforeLog) {
                    log('\n handleUpdateEntries(%o)\n\n', entries);
                }

                logEntries(entries, 0, []);
            };

            cancelAnimationFrame(frame);

            if (debounce) {
                frame = requestAnimationFrame(logEntriesUpdate);
            } else {
                logEntriesUpdate();
            }
        }

        if (window) {
            const key = `$pond${pondCounter}`;

            // @ts-ignore - create public pond instance
            const pondInstance = (window[key] = {
                insertEntries,
                removeEntries,
                updateEntry,
            });

            // let dev know about this instance
            log(
                `%c${extensionName}: %cFilePond instance available for debugging at %cwindow%c.%c${key}`,
                'color:grey',
                'color:auto',
                'color:grey',
                'color:grey',
                'color:auto',
                { '🔍': pondInstance }
            );

            // so next time we use this register this plugin a new instance is created
            pondCounter++;
        }

        const unsubUpdate = on('updateEntries', handleUpdateEntries);

        return {
            destroy: () => {
                unsubUpdate();
            },
        };
    },
});

declare module '../index.js' {
    interface FilePondElement {
        ConsoleView: ConsoleViewOptions;
    }
    interface DefineFilePondOptions {
        ConsoleView?: ConsoleViewOptions;
    }
}
