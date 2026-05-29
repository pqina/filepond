import type {
    FilePondElement,
    FilePondElementEventMap,
    FilePondInputElementEventMap,
} from 'filepond';

import type { DetailedHTMLProps, HTMLAttributes } from 'react';

/** Used to Filter out non function keys from the FilePondElement interface */
type NonFunctionKeys<T> = {
    [K in keyof T]: T[K] extends (...args: never[]) => unknown ? never : K;
}[keyof T];

type NonFunctionProps<T> = Pick<T, NonFunctionKeys<T>>;

/** Creates Rect event handlers from a passed event map (the Capture variant is for React 19 event capture mode) */
type CustomElementEventProps<EventMap> = {
    [K in keyof EventMap as K extends string ? `on${K}` : never]?: (event: EventMap[K]) => void;
} & {
    [K in keyof EventMap as K extends string ? `on${K}Capture` : never]?: (
        event: EventMap[K]
    ) => void;
};

/** Select the relevant props from the FilePondElement interface & add events from relevant event maps */
type FilePondElementPropsAndEvents = Partial<
    NonFunctionProps<Omit<FilePondElement, keyof HTMLElement>>
> &
    CustomElementEventProps<FilePondElementEventMap & FilePondInputElementEventMap>;

/** Merge default React element HTML attributes with the FilePondElementProps, the first part adds react html attributes and types the element ref (for example in an event) as FilePondElement */
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
