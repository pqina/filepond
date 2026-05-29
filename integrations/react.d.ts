import type { FilePondElement } from 'filepond';
import type { FilePondElementEventMap, FilePondElementProps } from './helpers';
import type { DetailedHTMLProps, HTMLAttributes } from 'react';

/** Creates React event handlers from a passed event map (the Capture variant is for React 19 event capture mode) */
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

/** Merge default React element HTML attributes with the FilePondElementPropsAndEvents, the first part adds React html attributes and types the element ref (for example in an event) as FilePondElement */
type FilePondReactElement = DetailedHTMLProps<HTMLAttributes<FilePondElement>, FilePondElement> &
    FilePondElementPropsAndEvents;

/** Register FilePond with React namespace thingy */
declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'file-pond': FilePondReactElement;
        }
    }
}

export {};
