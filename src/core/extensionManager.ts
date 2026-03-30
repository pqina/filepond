import { createTaskScheduler, type Task, type TaskOptions } from './taskScheduler.js';
import { pubsub } from '../utils/pubsub.js';
import { isArray } from '../utils/test.js';
import { arrayItemsEqual, arrayRemoveInPlace, arraySortByItemProp } from '../utils/array.js';
import type {
    ExtensionInstance,
    ExtensionState,
    ExtensionStatus,
    Extension,
} from '../extensions/common/createExtension.js';
import type { FilePondEntry, FilePondEntrySource } from '../types/index.js';
import type { createEntryTree, Needle } from './entryTree.js';

export type ExtensionFactory = Extension | [Extension, { [key: string]: unknown }];

export type ExtensionFactoryInsertInstructions =
    | Extension
    | [Extension, { [key: string]: unknown }]
    | [Extension, { [key: string]: unknown }, { before: string; after?: undefined }]
    | [Extension, { [key: string]: unknown }, { before?: undefined; after: string }];

export interface LoadedExtension {
    current?: any;
    index: number;
    instance: ExtensionInstance;
    factory: Extension;
}

export interface ExtensionManagerState {
    extension: {
        [name: string]: ExtensionState;
    };
}

export interface ExtensionManagerAPI {
    on: (event: string, callback: (detail?: any) => void) => () => void;

    setEntries: (entries: FilePondEntry[]) => void;
    getEntries: () => FilePondEntry[];

    // helper functions
    insertEntries: (entry: FilePondEntry | FilePondEntry[], index?: number | number[]) => void;
    removeEntries: (
        ...needles: Needle[]
    ) =>
        | ({ entry: FilePondEntry; index: number[] } | void)[]
        | { entry: FilePondEntry; index: number[] }
        | void;
    updateEntry: (needle: Needle, ...props: any[]) => void;
    replaceEntry: (needle: Needle, ...entries: FilePondEntry[]) => void;

    // running tasks
    pushTask: <T>(
        entryId: string,
        fn: (
            entry: T,
            options: { abortController: AbortController }
        ) => Promise<void | boolean> | void | boolean,
        options?: TaskOptions
    ) => void;

    abortTask: <T>(
        entryId: string,
        fn: (
            entry: T,
            options: { abortController: AbortController }
        ) => Promise<void | boolean> | void | boolean
    ) => void;

    abortTasks: (group?: string) => void;

    // update pond extension state
    setExtensionState: (state: any) => void;
    getExtensionState: () => any;
    setExtensionStatus: (status: ExtensionStatus) => void;
    getExtensionStatus: () => ExtensionStatus;
}

export interface ExtensionMangerInstance {
    on: (event: string, callback: (detail?: any) => void) => () => void;
    get extensions(): Extension[];
    set extensions(newExtensionFactories: ExtensionFactory[]);
    propagateExtensionProperty: (propertyName: string, value: any) => void;
    setExtensionProperties: (
        extensionName: string,
        props: {
            [key: string]: any;
        }
    ) => void;
    getExtensionProperties: (extensionName: string) =>
        | {
              [key: string]: any;
          }
        | undefined;
    getState(): {
        [name: string]: ExtensionState;
    };
    destroy(): void;
}

// for debugging task manager
function logTasks(tasks: Task[]) {
    console.log(`Tasks: ${tasks.length}`);
    for (const task of tasks) {
        const { group, fn, order, parallel, state, ..._ } = task;
        let icon = {
            // queued
            1: '📥',
            // active
            2: '👉',
            // failed
            3: '💥',
            // halted
            4: '🖐️',
        }[state];
        console.log(icon, group, fn.name, { parallel, order });
    }
    console.log('');
}

export function createExtensionManager(
    tree: ReturnType<typeof createEntryTree>
): ExtensionMangerInstance {
    // pubsub
    const { on, pub } = pubsub();

    /** Holds Currently loaded extensions */
    const extensions: LoadedExtension[] = [];

    // so we can easily expose these methods in the extension api
    const { insertEntries, replaceEntry, updateEntry, removeEntries } = tree;

    // schedule tasks
    const taskScheduler = createTaskScheduler({ log: undefined });

    /** Current Entry manager public state */
    const state: ExtensionManagerState = {
        extension: {},
    };

    function setExtensionState(name: string, extensionState: any) {
        state.extension[name] = {
            ...getExtensionState(name),
            ...extensionState,
        };

        // fire update event
        pub('update', state.extension);
    }

    function getExtensionState(name: string) {
        return state.extension[name] ?? {};
    }

    function setExtensionStatus(name: string, status: any) {
        setExtensionState(name, { status });
    }

    function getExtensionStatus(name: string) {
        return state.extension[name].status;
    }

    // when an entry is removed, automatically abort tasks
    tree.on('removeEntry', ({ entry }) => {
        taskScheduler.abortTasks(entry.id);
    });

    //
    function createExtensionInstance(factory: Extension): ExtensionInstance {
        /** Listen for events */
        const on = function (event: string, cb: (entry: FilePondEntry) => void) {
            return tree.on(event, cb);
        };

        /** Queued Calls */
        const queuedFunctionCalls: [(...args: any[]) => void, any[]][] = [];

        /** Holds Instance of extension */
        const instance: { current: any } = { current: undefined };

        instance.current = factory({
            // events
            on,

            // get root extension state
            setExtensionState: waitForInstance((props) => {
                setExtensionState(instance.current.name, props);
            }),
            getExtensionState: waitForInstance(() => getExtensionState(instance.current.name)),

            // get root extension status
            setExtensionStatus: waitForInstance((status) =>
                setExtensionStatus(instance.current.name, status)
            ),
            // @ts-ignore
            getExtensionStatus: waitForInstance(() => getExtensionStatus(instance.current.name)),

            pushTask: function <T>(
                key: string,
                fn: (
                    entry: T,
                    options: { abortController: AbortController }
                ) => Promise<void | boolean> | void | boolean,
                options?: TaskOptions
            ) {
                // need to get current extension so we can determine task order
                const extension = getExtensionInstanceWithName(
                    instance.current.name
                ) as LoadedExtension;

                // this entry is not available, we do this so we can't push tasks to run on an entry when that entry has been removed / is being removed
                const entry = tree.findEntries(key);
                if (!entry) {
                    return;
                }

                // try to run this task
                taskScheduler.pushTask(key, fn, {
                    // set order to factor of 100 so in theory there's plenty room for adding manual order
                    order: extension.index * 100,

                    // when params is a function it is called on run task
                    params: () => {
                        // find entry
                        const entry = tree.findEntries(key);

                        // adds entry as parameter
                        return [entry];
                    },

                    // add custom options
                    ...options,
                });
            },

            abortTask: function <T>(
                key: string,
                fn: (
                    entry: T,
                    options: { abortController: AbortController }
                ) => Promise<void | boolean> | void | boolean
            ) {
                taskScheduler.abortTask(key, fn);
            },

            abortTasks: (key?: string) => {
                taskScheduler.abortTasks(key);
            },

            setEntries: function (entries: FilePondEntrySource[]) {
                tree.entries = entries;
            },
            getEntries: () => tree.entries,

            // manipulating entry list
            insertEntries,
            removeEntries,
            replaceEntry,
            updateEntry,
        });

        /**
         * If functions are called when the constructor isn't done yet this makes sure they're
         * delayed a tiny bit
         */
        function waitForInstance(
            cb: (...args: unknown[]) => unknown
        ): (...args: unknown[]) => unknown {
            return (...args) => {
                // instance already set, we can just run this function
                if (instance.current) {
                    cb(...args);
                    return;
                }

                // instance not yet set, we're calling this function after the instance has been created
                queuedFunctionCalls.push([cb, args]);
            };
        }

        // loop over functions called during instance creation (most likely setState)
        queuedFunctionCalls.forEach(([cb, args]) => {
            cb(...args);
        });

        return instance.current;
    }

    // clean up existing extensions
    function destroyExtensions() {
        // abort all running processes
        taskScheduler.abortTasks();

        // destroy extensions
        extensions
            .map((extension) => extension.instance)
            .forEach((extensionInstance) => extensionInstance.destroy());

        // clear array
        extensions.length = 0;
    }

    const api = {
        // subscribe to events
        on,

        get extensions(): Extension[] {
            return extensions.map(({ factory }) => factory);
        },

        set extensions(newExtensionFactories: ExtensionFactory[]) {
            // no valid array received or no need to update because is same items
            if (!isArray(newExtensionFactories)) {
                return;
            }

            // flatten (remove props)
            const newFlatExtensionFactories = newExtensionFactories.map((factory) =>
                Array.isArray(factory) ? factory[0] : factory
            );

            // no changes detected
            if (arrayItemsEqual(newFlatExtensionFactories, api.extensions)) {
                // only apply props
                for (const newExtensionFactory of newExtensionFactories) {
                    // skip if no props defined
                    if (!isArray(newExtensionFactory)) {
                        continue;
                    }

                    // get reference to the loaded extension
                    const loadedExtension = extensions.find((extension) => {
                        return newExtensionFactory[0] === extension.factory;
                    });

                    // @ts-ignore update props
                    attemptSetExtensionInstanceProps(loadedExtension, newExtensionFactory[1]);
                }

                return;
            }

            // clear all extensions and their cached props when empty array is passed
            if (newExtensionFactories.length === 0) {
                cachedSetterCalls.clear();
                destroyExtensions();
            }

            // find extensions that aren't in the new factories array so we can remove them
            for (const extension of extensions) {
                // an existing extension must be unloaded
                if (!newFlatExtensionFactories.includes(extension.factory)) {
                    extension.instance.destroy();
                    arrayRemoveInPlace(extensions, (ext: LoadedExtension) => ext === extension);
                    continue;
                }
            }

            // now we loop over the factories to find the ones that aren't yet existing so we can add them
            for (const [index, extensionFactory] of Object.entries(newFlatExtensionFactories)) {
                // we need index to be an int
                const i = parseInt(index, 10);

                // if already includes extension, ignore
                const loadedExtension = extensions.find((extension) => {
                    return extensionFactory === extension.factory;
                });

                // update index and props based on location of extension in factory array
                if (loadedExtension) {
                    loadedExtension.index = i;
                    if (Array.isArray(newExtensionFactories[i])) {
                        const newExtensionProps = newExtensionFactories[i][1];
                        attemptSetExtensionInstanceProps(loadedExtension, newExtensionProps);
                    }
                    continue;
                }

                // add new (we'll sort later)
                extensions.push({
                    index: i,
                    factory: extensionFactory,
                    instance: createExtensionInstance(extensionFactory),
                });

                // set props if were defined
                if (Array.isArray(newExtensionFactories[i])) {
                    const newExtensionProps = newExtensionFactories[i][1];
                    attemptSetExtensionInstanceProps(extensions.at(-1), newExtensionProps);
                }
            }

            // sort extensions by index in factory array
            arraySortByItemProp(extensions, 'index');

            // propagate previously stored props
            Object.entries(cachedSetterCalls.get('*') ?? []).forEach(
                ([propertyName, propertyValue]) => {
                    propagateExtensionProperty(propertyName, propertyValue);
                }
            );

            // set previously stored props
            for (const [extensionName, props] of cachedSetterCalls) {
                if (extensionName === '*') {
                    continue;
                }
                setExtensionProperties(extensionName, props);
            }

            // we need to know which extensions were added
            const extensionNames = extensions.map((extension) => extension.instance.name);
            pub('setExtensions', { extensionNames });

            // trigger entry updates
            tree.entries = [...tree.entries];
        },

        propagateExtensionProperty,

        setExtensionProperties,
        getExtensionProperties,

        // access manager state
        getState() {
            return state.extension;
        },

        // destroy FilePond instance
        destroy() {
            destroyExtensions();
        },
    };

    function propagateExtensionProperty(propertyName: string, value: any) {
        const props = { [propertyName]: value };

        const extensions = getExtensionInstancesWithProperty(propertyName);
        for (const extension of extensions) {
            attemptSetExtensionInstanceProps(extension, props);
        }

        // cache these props under generic *
        cacheSetterCall('*', props);
    }

    function setExtensionProperties(
        extensionName: string,
        props: {
            [key: string]: any;
        }
    ) {
        const extension = getExtensionInstanceWithName(extensionName);

        // attempts to set
        if (extension) {
            attemptSetExtensionInstanceProps(extension, props);
        } else {
            cacheSetterCall(extensionName, props);
        }
    }

    function getExtensionProperties(extensionName: string) {
        const extension = getExtensionInstanceWithName(extensionName);
        if (!extension) {
            return;
        }

        // extension has an instance, so let's return live props
        const { instance } = extension;
        if (!instance) {
            return;
        }

        return instance.getProps();
    }

    /** Sets a set of props on a given extension instance */
    function attemptSetExtensionInstanceProps(extension: any, props: { [key: string]: unknown }) {
        // no props to set
        if (!props) {
            return;
        }

        // set props
        extension.instance.setProps(props);

        // always try to cache
        cacheSetterCall(extension.instance.name, props);
    }

    /** Returns the extension instance that exposes this prop */
    function getExtensionInstancesWithProperty(propertyName: string) {
        return extensions.filter((extension) => {
            const definedProps = extension.instance.getProps();
            return Object.keys(definedProps).includes(propertyName);
        });
    }

    /** Returns the extension that exposes this prop */
    function getExtensionInstanceWithName(name: string) {
        return extensions.find((extension) => extension.instance.name === name);
    }

    /** Extension props fallback for when extension doesn't have getProps getter */
    const cachedSetterCalls: Map<string, { [key: string]: unknown }> = new Map();

    function cacheSetterCall(extensionName: string, props: { [key: string]: unknown }) {
        cachedSetterCalls.set(extensionName, {
            ...cachedSetterCalls.get(extensionName),
            ...props,
        });
    }

    return api;
}
