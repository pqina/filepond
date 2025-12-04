import { getContext, setContext } from 'svelte';
import type { EntryAnimation, FilePondEntry, Locale, SpringOptions } from '../../../types/index.js';
import type { Rect } from '../../../utils/rect.js';
import type { AnimatedEntry, AppCallbacks } from '../index.js';

export interface AppContext extends AppCallbacks {
    readonly disabledState: boolean;
    readonly enableAnimations: boolean;
    readonly locale: Locale;
    readonly assets: { [key: string]: string };
    readonly resources: {
        locale: Locale;
        assets: { [key: string]: string };
    };
    readonly springConfig: SpringOptions | undefined;
    readonly propResourceMap: {
        [componentProperty: string]: string;
    };
    readonly retainedEntries: { index: number; entry: FilePondEntry }[];
    readonly animatedEntries: {
        [id: string]: AnimatedEntry;
    };
    readonly entryAnimationProps: {
        [animation: string]: EntryAnimation;
    };

    updateEntryPlaceholderRect: (rect?: Rect) => void;
}

const key = {};

export function setAppContext(value: AppContext) {
    setContext(key, value);
}

export function getAppContext(): AppContext {
    return getContext(key);
}
