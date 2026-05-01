import { warn } from '../../common/console.js';
import { copyDescriptors, isObjectValuesEqual } from '../../utils/object.js';
import { isObject, isString } from '../../utils/test.js';

import type { ExtensionManagerAPI } from '../../core/extensionManager.js';
import type { FilePondEntry, Progress } from '../../types/index.js';

type EmptyObject = Record<PropertyKey, never>;

export interface ExtensionState {
    /** Current extension status */
    status?: ExtensionStatus;

    /** The actions that are available on this extension, used for toggling UI features */
    actions?: string[];

    /** Free to set other props */
    [key: string]: unknown;
}

export type ExtensionStatusType = 'error' | 'warning' | 'success' | 'info' | 'system';

export interface ExtensionStatus {
    type: ExtensionStatusType;
    code: string;
    subcode?: string;
    values?: { [key: string]: any } | null;
    progress?: number | null;
    meta?: { [key: string]: any } | null;
}

export interface ExtensionOptions {
    props: any;
    didSetProps: (cb: (props: any) => void) => void;
    extensionName: string;
    extensionType: ExtensionType;
}

export interface ExtensionAPI extends ExtensionManagerAPI {
    // update entry extension state
    getEntryExtensionState: (entry: FilePondEntry) => { [key: string]: any };
    setEntryExtensionState: (entry: FilePondEntry, state: { [key: string]: any }) => void;
    getEntryExtensionStatus: (entry: FilePondEntry) => ExtensionStatus | EmptyObject;
    setEntryExtensionStatus: (entry: FilePondEntry, status: ExtensionStatus) => void;

    // helper
    createProgressHandler: (entry: FilePondEntry) => (e: Progress) => void;
}

export type ExtensionFactoryFunction = (
    instance: ExtensionOptions,
    api: ExtensionAPI
) => { destroy: () => void };

export interface ExtensionInstance {
    /** Extension name */
    get name(): string;

    /** Current props */
    getProps: () => { [key: string]: any };

    /** New props */
    setProps: (newProps: { [key: string]: any }) => void;

    /** Clean up extension */
    destroy: () => void;
}

export type ExtensionType =
    | 'source'
    | 'loader'
    | 'validator'
    | 'transform'
    | 'resource'
    | 'view'
    | 'store';

export type Extension = ((pond: ExtensionManagerAPI) => ExtensionInstance) & {
    readonly name: string;
    readonly type: ExtensionType;
};

export interface CreateExtensionOptions {
    name: string;
    type: ExtensionType;
    props: any;
    factory: ExtensionFactoryFunction;
}

export function createExtension(options: CreateExtensionOptions): Extension {
    const { name, type, props, factory } = options || ({} as CreateExtensionOptions);

    const fn = (pond: ExtensionManagerAPI): ExtensionInstance => {
        if (!isString(name) || !name) {
            warn('Extension name missing or invalid');
        }

        /** Returns entry state for this extension */
        function getEntryExtensionState(entry: FilePondEntry) {
            return entry.extension?.[name] ?? {};
        }

        /** Updates item state */
        function setEntryExtensionState(entry: FilePondEntry, state: ExtensionState) {
            pond.updateEntry(entry, {
                extension: {
                    [name]: state,
                },
            });
        }

        function setEntryExtensionStatus(entry: FilePondEntry, status: ExtensionStatus) {
            setEntryExtensionState(entry, { status });
        }

        function getEntryExtensionStatus(entry: FilePondEntry): ExtensionStatus | EmptyObject {
            return getEntryExtensionState(entry).status ?? {};
        }

        /** Creates a progress handler function */
        function createProgressHandler(entry: FilePondEntry): (progress: Progress) => void {
            const status = getEntryExtensionStatus(entry);

            // we use status code and type when the handler is created, alternatively can pass custom status
            const { type, code } = status ?? getEntryExtensionStatus(entry);

            // return handler
            return ({ lengthComputable, loaded, total }) => {
                setEntryExtensionStatus(entry, {
                    type,
                    code,
                    progress: lengthComputable ? loaded / total : Infinity,
                });
            };
        }

        /** So we can compare new props with old props */
        let currentProps = { ...props };

        /** So extension can detect prop updates */
        let didSetPropsCallbacks: ((props: any) => void)[] = [];

        function didSetProps(cb: (props: any) => any) {
            didSetPropsCallbacks.push(cb);

            // run callback instantly
            cb(getProps());
        }

        const instance = factory(
            // instance
            {
                // reference to current props so extension always has latest values
                props: currentProps,

                // called when props updated (when setProps called and on init)
                didSetProps,

                // return name of this extension
                extensionName: name,

                // return type of this extension
                extensionType: type,
            },
            {
                // merge extension manager with extension api
                ...pond,
                getEntryExtensionState,
                setEntryExtensionState,
                setEntryExtensionStatus,
                getEntryExtensionStatus,
                createProgressHandler,
            }
        );

        function setProps(newProps: { [key: string]: any }) {
            // invalid props object
            if (!isObject(newProps)) {
                return;
            }

            // already set these props? (if newProps exists in currentProps)
            if (isObjectValuesEqual(newProps, currentProps)) {
                return;
            }

            // so we can compare next time setProps is called
            Object.assign(currentProps, newProps);

            // did update props
            didSetPropsCallbacks.forEach((cb) => cb(getProps()));
        }

        function getProps() {
            return { ...currentProps };
        }

        return copyDescriptors(instance, {
            setProps,
            getProps,
            get name() {
                return name;
            },
            destroy() {
                instance.destroy();
            },
        });
    };

    Object.defineProperties(fn, {
        name: { value: name, writable: false },
        type: { value: type, writable: false },
    });

    return fn as Extension;
}
