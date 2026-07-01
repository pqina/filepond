import {
    FilePondSvelteComponentElement,
    type FilePondSvelteComponentOptions,
} from '../FilePondSvelteComponent/index.svelte.js';
import type { Locale, TemplateNode } from '../../types/index.js';
import FilePondSourceListApp from './index.svelte';
import { registerShadowRoot } from '../common/extendStyles.js';
import defaultStyles from '../styles/defaults.css?inline';
import styles from './index.css?inline';
import { setBooleanAttribute } from '../../utils/dom.js';

// Props to create getters and setters for, the defaults for these props are set in the FilePondEntryList component
export const COMPONENT_PROPS = [
    'disabled',
    'assets',
    'locale',
    'template',
    'propResourceMap',
    'animations',
    'springDefaults',
    'beforeRenderNode',
    'sources',
    'propResourceMap',
];

export class FilePondSourceListElement extends FilePondSvelteComponentElement {
    constructor() {
        super(FilePondSourceListApp, {
            styles: [styles],
            properties: COMPONENT_PROPS,
        });

        registerShadowRoot(this._root, defaultStyles + styles);
    }

    connectedCallback() {
        super.connectedCallback();

        this.addListener('sourceschange', (e) => {
            setBooleanAttribute(this, 'empty', e.detail === 0);
        });
    }
}

export interface FilePondSourceListSource {
    label: string;
    icon?: string;
    action: string;
}

export interface FilePondSourceListOptions extends Omit<FilePondSvelteComponentOptions, 'root'> {
    /** Available sources */
    sources: FilePondSourceListSource[];

    /** Template to use for rendering different types */
    template: TemplateNode[];

    /** The assets resource to use for icons, defaults to `{}` */
    assets?: { [key: string]: string };

    /** The locale resource props to use for text, defaults to `{}` */
    locale?: Locale;

    /**
     * Automatically maps a property name to a resource value in locale and/or assets, defaults to `{ title: 'locale', label: 'locale', icon: 'assets' }` meaning that the value of a `label` property is automatically looked up in the `locale` property
     */
    propResourceMap?: { [componentProperty: string]: string };
}
