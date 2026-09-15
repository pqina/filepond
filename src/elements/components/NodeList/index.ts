export { default as NodeList } from './index.svelte';

import type { SpringOptions } from '../../../types/index.js';
import type {
    TemplateNode,
    NodeContext,
    NodeData,
    ComponentNode,
    ElementNode,
} from '../../common/nodeTree.js';

export interface NodeListOptions {
    /** reduceMotion in node list itself */
    reduceMotion: boolean;

    /** Default spring options to use */
    springOptions: SpringOptions | undefined;

    /** The nodes to render */
    nodes: TemplateNode[];

    /** The context available to the current items as received by the parent */
    data?: NodeData;

    /** Context shared by all nodes */
    context?: NodeContext;

    /** Routes between nodes */
    routes?: { [key: string]: { [event: string]: () => void } };

    /** Allows manipulating the component props */
    beforeSetProps?: (node: { [key: string]: any }) => { [key: string]: any };

    /** Allows node manipulation before rendering */
    beforeRenderNode?: (
        node: ComponentNode | ElementNode,
        data: NodeContext,
        context: NodeContext
    ) => TemplateNode | false | void;
}
