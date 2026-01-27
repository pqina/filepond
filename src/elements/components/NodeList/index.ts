export { default as NodeList } from './index.svelte';

import { type TemplateNode, type NodeContext } from '../../common/nodeTree.js';

export interface NodeListOptions {
    /** The nodes to render */
    nodes: TemplateNode[];

    /** The context available to the current items as received by the parent */
    context: NodeContext;

    /** Context shared by all nodes */
    sharedContext: NodeContext;

    /** Routes between nodes */
    routes?: { [key: string]: { [event: string]: () => void } };

    /** Allows manipulating the component props */
    beforeSetProps: (node: { [key: string]: any }) => { [key: string]: any };

    /** Allows node manipulation before rendering */
    beforeRenderNode: (
        node: TemplateNode,
        context: NodeContext,
        sharedContext: NodeContext
    ) => TemplateNode | false | void;
}
