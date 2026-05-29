import type { FilePondElement } from 'filepond';
import type { FilePondElementEventMap, FilePondElementProps } from './helpers';
import type { HTMLAttributes } from 'svelte/elements';

// Add `on:` and `on` attributes for event keys
type CustomElementEventProps<EventMap> = {
    [K in keyof EventMap as K extends string ? `on:${K}` : never]?: (event: EventMap[K]) => void;
} & {
    [K in keyof EventMap as K extends string ? `on${K}` : never]?: (event: EventMap[K]) => void;
};

// Merge Props and Events
type FilePondElementPropsAndEvents = FilePondElementProps &
    CustomElementEventProps<FilePondElementEventMap>;

type FilePondSvelteElement = HTMLAttributes<FilePondElement> & FilePondElementPropsAndEvents;

declare module 'svelte/elements' {
    export interface SvelteHTMLElements {
        'file-pond': FilePondSvelteElement;
    }
}

export {};
