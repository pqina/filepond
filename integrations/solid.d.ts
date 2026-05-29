import type { FilePondElement } from 'filepond';
import type { FilePondElementEventMap, FilePondElementProps } from './helpers';
import type { JSX } from 'solid-js';

/** Creates Solid event handlers from a passed event map (the Capture variant is for Solid 19 event capture mode) */
type CustomElementEventProps<EventMap> = {
    [K in keyof EventMap as K extends string ? `on${K}` : never]?: (event: EventMap[K]) => void;
} & {
    [K in keyof EventMap as K extends string ? `on${K}Capture` : never]?: (
        event: EventMap[K]
    ) => void;
};

// Merge Props and Events
type FilePondElementPropsAndEvents = FilePondElementProps &
    CustomElementEventProps<FilePondElementEventMap>;

/** Merge default Solid element HTML attributes with the FilePondElementPropsAndEvents */
type FilePondSolidElement = Omit<
    JSX.HTMLAttributes<FilePondElement>,
    keyof FilePondElementPropsAndEvents
> &
    FilePondElementPropsAndEvents;

/** Register FilePond with Solid namespace thingy */
declare module 'solid-js' {
    namespace JSX {
        interface IntrinsicElements {
            'file-pond': FilePondSolidElement;
        }
    }
}

export {};
