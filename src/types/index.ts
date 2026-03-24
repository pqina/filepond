import type {
    Extension,
    ExtensionState,
    ExtensionStatus,
    ExtensionInstance,
} from '../extensions/common/createExtension.js';

import type { ExtensionManagerAPI } from '../core/extensionManager.js';

import type { TaskArgs, TaskOptions } from '../core/taskScheduler.js';

import type { FilePondElement } from '../elements/FilePondDefault/index.js';

import type { FilePondInputElement } from '../elements/FilePondInput/index.js';

import type { Needle } from '../core/entryTree.js';

import type {
    TemplateNode,
    NodeContext,
    BaseNode,
    ElementNode,
    ComponentNode,
} from '../elements/common/nodeTree.js';

import type { Vector } from '../utils/vector.js';

export type {
    Needle,
    Vector,
    TemplateNode,
    ElementNode,
    BaseNode,
    ComponentNode,
    NodeContext,
    FilePondElement,
    FilePondInputElement,
    Extension,
    ExtensionInstance,
    ExtensionState,
    ExtensionStatus,
    ExtensionManagerAPI,
    TaskArgs,
    TaskOptions,
};

export type Partial<T> = {
    [P in keyof T]?: T[P];
};

export type SpringOptions = { stiffness: number; damping: number; precision: number };

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

/** A function used to intercept options sent to `XMLHttpRequest` */
export type RequestHook = (
    url: string,
    options: PublicRequestOptions,
    entry: FilePondEntry
) => PublicRequestOptions;

export interface PublicRequestOptions {
    method: 'GET' | 'POST' | 'HEAD' | 'PUT' | 'DELETE' | 'PATCH';
    data?: any;
    formData?: ([string, string] | [string, File] | [string, File, string])[];
    queryString?: { [key: string]: string | number };
    headers?: { [key: string]: string | number };
    withCredentials?: boolean;
    timeout?: number;
}

export type EntrySource = FilePondEntry | string | File | Blob | HTMLCanvasElement | DataTransfer;

export type EntryOrigin = 'api' | 'input' | 'drop' | 'clipboard' | 'remote';

/**
 * Hello World
 */
export interface FilePondEntryBase {
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

    /** Id of the container entry (DataTranfer, Archive) this file was "extracted" from */
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

export type PartialFilePondEntry = (
    | Partial<FilePondDirectoryEntry>
    | Partial<FilePondFileEntry>
    | Partial<FilePondDataTransferEntry>
) & { src?: EntrySource };

export interface DynamicLocaleMap {
    /**
     * The string to use for this amount.
     *
     * 1: "1 file"
     */
    [key: number]: string | boolean | number | null;

    /**
     * The default placeholder to use for this key.
     *
     * "{{minFiles}} files"
     */
    else: string | boolean | number | null;
}

export interface DynamicLocale {
    /**
     * The template string to use.
     *
     * "Too few files in the list. Minimum required is {{minFiles}}."
     */
    template: string;

    /** The keys that can be replaced */
    variables: {
        /**
         * The variable key
         *
         * "minFiles"
         */
        [key: string]:
            | DynamicLocaleMap
            | {
                  /** Optionally select data property to count with */
                  context?: string;
                  map: DynamicLocaleMap;
              };
    };
}

/** A FilePond Locale object */
export interface Locale {
    [key: string]: string | DynamicLocale;
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
    opacitySpringOptions?: any;
    opacityFrom?: number;
    opacity?: number;
    scaleSpringOptions?: any;
    scaleFrom?: number;
    scale?: number;
    translationSpringOptions?: any;
    translationFrom?: Vector;
    translation?: Vector;
}

/**
 * The animation mode of the interface. Defaults to `'auto'`, set to `'always'` to force animation, even if users prefers no animation, set to `'never'` to never animate the user interface.
 */
export type AnimationMode = 'auto' | 'always' | 'never';

export interface FilePondSvelteComponentOptions {
    root: HTMLElement;

    /** Control animations */
    animations?: AnimationMode;

    /** Generic Spring configuration to use */
    springDefaults?: SpringOptions;
}

export interface FilePondEntryListOptions extends Omit<FilePondSvelteComponentOptions, 'root'> {
    /** Set entries in list */
    entries?: FilePondEntry[];

    /** Template to use for rendering different types */
    template?: TemplateNode[];

    /** Hook to manipulate nodes before rendering */
    beforeRenderNode?: (
        node: TemplateNode,
        context: NodeContext,
        sharedContext: NodeContext
    ) => TemplateNode | void | false;

    /** Toggle drop functionality on/off */
    drop?: boolean;

    /** Which element to use as drop container, defaults to `null` */
    dropRoot?: HTMLElement;

    /** Padding around drop area that will also catch drops, defaults to `20` */
    dropPadding?: number;

    /** Toggle drag functionality on/off */
    drag?: boolean;

    /**
     * The distance from the root element after which the element will be detached from the list,
     * defaults to `40`
     */
    dragDetachMargin?: number;

    /**
     * The distance from the root element after which the element will be removed when dropped,
     * defaults to `80`, set to `Infinity` to prevent removal by dragging
     */
    dragSafetyMargin?: number;

    /** Toggle the UI on/off */
    disabled?: boolean;

    /** Maps Entry origin to animation for intro effect */
    entryAnimationOriginMap?: { [origin: string]: string };

    /** Animation configuration for each entry animation */
    entryAnimationProps?: { [animation: string]: EntryAnimation };

    /** Delay to use between entry animations that are staggered (insert / remove) */
    entryAnimationStaggerInterval?: number;

    /** The assets resource to use for icons, defaults to `{}` */
    assets?: { [key: string]: string };

    /** The locale resource props to use for text, defaults to `{}` */
    locale?: { [key: string]: string };

    /** The data format to use in the templates */
    byteUnits?: 'mega' | 'mebi';

    /**
     * Automatically maps a property name to a resource value in locale and/or assets, defaults to
     * `{ title: 'locale', label: 'locale', icon: 'assets' }` meaning that the value of a `label`
     * property is automatically looked up in the `locale` property
     */
    propResourceMap?: { [componentProperty: string]: string };
}
