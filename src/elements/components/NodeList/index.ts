export { default as NodeList } from './index.svelte';

import type { SpringOptions } from '../../../types/index.js';
import type {
    TemplateNode,
    NodeContext,
    NodeData,
    ComponentNode,
    ElementNode,
    NodePropResourceMap,
    NodeResources,
} from '../../common/nodeTree.js';

export interface NodeListOptions {
    /** reduceMotion in node list itself */
    reduceMotion: boolean;

    /** Default spring options to use */
    springOptions: SpringOptions | undefined;

    /** Resources available */
    resources: NodeResources;

    /** Automatically maps a property name to a resource value in locale and/or assets, defaults to `{ title: 'locale', label: 'locale', icon: 'assets' }` meaning that the value of a `label` property is automatically looked up in the `locale` property */
    propResourceMap: NodePropResourceMap;

    /** The nodes to render */
    nodes: TemplateNode[];

    /** The context available to the current items as received by the parent */
    data?: NodeData;

    /** Context shared by all nodes */
    context?: NodeContext;

    /** Routes between nodes */
    routes?: { [key: string]: { [event: string]: () => void } };

    /** Allows node manipulation before rendering */
    beforeRenderNode?: (
        node: ComponentNode | ElementNode,
        data: NodeContext,
        context: NodeContext
    ) => void | false | ComponentNode | ElementNode;
}

export type NodeOptions = Omit<NodeListOptions, 'nodes' | 'routes'> & {
    index: number;
    node: any;
    scope: {
        refs: Record<string, any>;
        readonly routes: any;
    };
};
