import type {
    Extension,
    ExtensionType,
    ExtensionState,
    ExtensionStatus,
    ExtensionInstance,
    ExtensionFactoryFunction,
    ExtensionOptions,
    ExtensionContext,
} from '../extensions/common/createExtension.js';

import type { ExtensionManagerContext } from '../core/extensionManager.js';
import type { FilePondElement } from '../elements/FilePondDefault/index.js';
import type { FilePondInputElement } from '../elements/FilePondInput/index.js';
import type { FilePondEntryListElement } from '../elements/FilePondEntryList/index.js';
import type { FilePondDropAreaElement } from '../elements/FilePondDropArea/index.js';
import type { FilePondDropIndicatorElement } from '../elements/FilePondDropIndicator/index.js';
import type { FilePondSvelteComponentElement } from '../elements/FilePondSvelteComponent/index.svelte.js';
import type { Needle } from '../core/entryTree.js';

export type {
    CreateExtensionManagerOptions,
    ExtensionManagerInstance,
} from '../core/extensionManager.js';
export type { CreateEntryTreeOptions, EntryTreeInstance } from '../core/entryTree.js';
export type { CreateTaskSchedulerOptions } from '../core/taskScheduler.js';

import type {
    TemplateNode,
    NodeContext,
    BaseNode,
    ElementNode,
    ComponentNode,
} from '../elements/common/nodeTree.js';

import type { Vector } from '../utils/vector.js';

export type { DefineFilePondOptions } from '../elements/FilePondDefault/index.js';

export type { CreateExtensionOptions } from '../extensions/common/createExtension.js';
export type {
    PerceivedPerformanceOptions,
    CreateStoreExtensionOptions,
    StoreExtensionOptions,
} from '../extensions/common/createStoreExtension.js';
export type {
    CreateTransformExtensionOptions,
    TransformExtensionOptions,
} from '../extensions/common/createTransformExtension.js';
export type {
    CreateValidatorExtensionOptions,
    ValidatorExtensionOptions,
} from '../extensions/common/createValidatorExtension.js';

export type {
    Needle,
    TemplateNode,
    ElementNode,
    BaseNode,
    ComponentNode,
    NodeContext,
    FilePondElement,
    FilePondInputElement,
    FilePondDropAreaElement,
    FilePondDropIndicatorElement,
    FilePondEntryListElement,
    FilePondSvelteComponentElement,
    Extension,
    ExtensionType,
    ExtensionInstance,
    ExtensionState,
    ExtensionStatus,
    ExtensionManagerContext,
    ExtensionFactoryFunction,
    ExtensionOptions,
    ExtensionContext,
};

type Partial<T> = {
    [P in keyof T]?: T[P];
};

export type SpringOptions = { stiffness: number; damping: number; precision?: number };

/**
 * A progress object which is passed to `onprogress` callbacks
 */
export type Progress = {
    /** Is `true` if the `loaded` value and `total` value is known. */
    lengthComputable: boolean;

    /** Currently loaded value, the progress made. */
    loaded: number;

    /** Total value, the total value we're progressing towards. */
    total: number;
};

export interface RequestOptions {
    /** Request method */
    method?: 'GET' | 'POST' | 'HEAD' | 'PUT' | 'DELETE' | 'PATCH';

    /** Data to post with the request */
    data?: any;

    /** FormData to add to the request (in Array format) */
    formData?: ([string, string] | [string, File] | [string, File, string])[];

    /** QueryString to append to the URL */
    queryString?: { [key: string]: string | number };

    /** Request headers to add to the request */
    headers?: { [key: string]: string | number };

    /** Toggle `withCredentials`, defaults to `false` */
    withCredentials?: boolean;

    /** Set timeout, defaults to `0` */
    timeout?: number;
}

export type EntrySource = FilePondEntry | string | File | Blob | HTMLCanvasElement | DataTransfer;

export type EntryOrigin = 'api' | 'input' | 'drop' | 'clipboard' | 'remote';

/**
 * Hello World
 */
interface FilePondEntryBase {
    /** Unique id for this entry */
    id: string;

    /** Name of this entry, automatically copied from `.file` if is `FilePondFileEntry` */
    name?: string;

    /** Path of the entry if available */
    path?: string;

    /** Private extension state (don't manipulate) */
    extension: {
        [extensionName: string]: ExtensionState;
    };

    /** Public entry state (do manipulate) */
    state: { [key: string]: any };

    /** How and when was this file entry added */
    origin: EntryOrigin;

    /** Id of the container entry (DataTransfer, Archive) this file was "extracted" from */
    containerId: string | null;

    /** Optional entry metadata */
    meta?: any;
}

export interface FilePondDataTransferEntry extends FilePondEntryBase {
    /** A DataTransfer object */
    src: DataTransfer;
}

export interface FilePondFileEntry extends FilePondEntryBase {
    /** Source of the File in `.file` */
    src: EntrySource;

    /** Current File object read from `.src` */
    file?: File;

    /** Original file object should the `.file` read from `.src` have been transformed */
    fileOriginal?: File;

    /** Type to use, automatically copied from `.file` when it's updated */
    type?: string;

    /** Size to use, automatically copied from `.file` when it's updated */
    size?: number;

    /** Date to use, automatically copied from `.file` when it's updated */
    lastModified?: Date;
}

export interface FilePondDirectoryEntry extends FilePondEntryBase {
    /** Has entries property as directory can contain zero or more entries */
    entries: FilePondEntry[];
}

export type FilePondEntry = FilePondFileEntry | FilePondDirectoryEntry | FilePondDataTransferEntry;

export type FilePondEntrySource = Partial<FilePondEntry> | EntrySource;

type LocalePrimitive = string | boolean | number | null;

export interface DynamicLocaleMap {
    /** The string to use for this amount. `1: "1 file"` */
    [key: number]: LocalePrimitive | undefined;

    /** The default placeholder to use for this key */
    else?: LocalePrimitive;
}

export interface DynamicLocale {
    /** The template string to use. Can contain variables. Variables are defined with double curly braces. */
    template: string;

    /** The variable keys that can be replaced */
    variables: {
        [key: string]:
            | DynamicLocaleMap
            | {
                  context?: string;
                  map: DynamicLocaleMap;
              };
    };
}

type LocaleValue = string | DynamicLocale;

export interface Locale {
    [key: string]: LocaleValue | DynamicLocaleMap;
    [key: `unit${string}`]: DynamicLocaleMap;
}

export interface EntryListFunctions {
    insertEntries: (
        entry: FilePondEntrySource | FilePondEntrySource[],
        index?: number | number[]
    ) => void;
    removeEntries: (
        ...needles: Needle[]
    ) =>
        | ({ entry: FilePondEntry; index: number[] } | void)[]
        | { entry: FilePondEntry; index: number[] }
        | void;
    updateEntry: (needle: Needle, ...props: any[]) => void;
    updateEntryState: (needle: Needle, state: { [key: string]: any }) => void;
}

export type Template = (api: EntryListFunctions) => TemplateNode[];

export interface EntryAnimation {
    opacitySpringOptions?: SpringOptions;
    opacityFrom?: number;
    opacity?: number;
    scaleSpringOptions?: SpringOptions;
    scaleFrom?: number;
    scale?: number;
    translationSpringOptions?: SpringOptions;
    translationFrom?: Vector;
    translation?: Vector;
}

/**
 * The animation mode of the interface. Defaults to `'auto'`, set to `'always'` to force animation, even if users prefers no animation, set to `'never'` to never animate the user interface.
 */
export type AnimationMode = 'auto' | 'always' | 'never';
