import type { EmitFn, HTMLAttributes, PublicProps } from 'vue';
import type { FilePondElement } from 'filepond';
import type { FilePondElementEventMap, FilePondElementProps } from './helpers';

// Maps a custom element event map to Vue's component emit signature. This lets Vue infer the event object type in template listeners, for example `@entrieschange="(event) => ..."` receives `CustomEvent<FilePondEntry[]>`.
type VueEmit<Events> = EmitFn<{
    [K in keyof Events]: Events[K] extends Event ? (event: Events[K]) => void : never;
}>;

// Describes a browser custom element in the shape Vue expects for template type-checking. Vue reads `$props` for allowed attributes / properties and `$emit` for allowed events, even though neither property exists at runtime.
type DefineCustomElement<
    ElementType extends HTMLElement,
    Events = {},
    SelectedProps extends keyof ElementType = keyof ElementType,
> = new () => ElementType & {
    /** @deprecated Template prop types only. */
    $props: HTMLAttributes & Partial<Pick<ElementType, SelectedProps>> & PublicProps;

    /** @deprecated Template event types only. */
    $emit: VueEmit<Events>;
};

// Add the new element type to Vue's GlobalComponents type.
declare module 'vue' {
    interface GlobalComponents {
        'file-pond': DefineCustomElement<
            FilePondElement,
            FilePondElementEventMap,
            keyof FilePondElementProps
        >;
    }
}

export {};
