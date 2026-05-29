import type { EmitFn, HTMLAttributes, PublicProps } from 'vue';
import type { FilePondElement } from 'filepond';
import type { FilePondElementEventMap, FilePondElementProps } from './helpers';

type VueEmitOptions<Events> = {
    [K in keyof Events & string]: (event: Events[K]) => void;
};

type VueEventHandlerProps<Events> = {
    [K in keyof Events & string as `on${Capitalize<K>}`]?: (event: Events[K]) => void;
};

type DefineCustomElement<
    ElementType extends HTMLElement,
    Events = {},
    SelectedAttributes extends keyof ElementType = keyof ElementType,
> = new () => ElementType & {
    $props: HTMLAttributes &
        Partial<Pick<ElementType, SelectedAttributes>> &
        VueEventHandlerProps<Events> &
        PublicProps;

    $emit: EmitFn<VueEmitOptions<Events>>;
};

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
