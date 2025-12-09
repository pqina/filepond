// TODO: fix @ts-ignore

import { type SpringOptions, type Template } from '../../types/index.js';
import { arrayInsertAtIndex, arrayRemoveFalsy, arrayWrap } from '../../utils/array.js';
import { isArray, isFunction } from '../../utils/test.js';
import { hasOwnProp } from '../../utils/object.js';

export type NodeContext = { [key: string]: any };

export interface BaseNode {
    /** Unique key for this node */
    key?: string;

    /** Select props from context and add to context for this node */
    context?: (context: NodeContext) => NodeContext;

    /** Routes to listen to */
    routes?: { [event: string]: string };

    /** Apply transition `when` toggled */
    transition?: {
        fn: (
            node: HTMLElement,
            options?: { duration?: number; easing?: (t: number) => number }
        ) => { duration: number; easing: (t: number) => number; tick: (t: number) => void };
        duration?: number;
        easing?: (t: number) => number;
        when: (context: NodeContext) => boolean;
    };

    /**
     * Automatically create springs for props, returned properties are added to context for this
     * node
     */
    spring?: (context: NodeContext) => {
        /** Property name to expose on context */
        [propertyName: string]: {
            /** Value to set */
            value: number | null | undefined;

            /** Transform to apply to spring output */
            transform?: (value: number) => number;

            /** Spring configuration to use */
            config?: SpringOptions;
        };
    };

    /** Children of this node, can be falsy children in array */
    children?: string | TemplateNode | (TemplateNode | undefined)[];
}

export interface ElementNode extends BaseNode {
    /** HTML tag, defaults to `'div'` */
    tag?: string;

    /** Attributes to add to the HTML element */
    attrs?: { [key: string]: any } | ((context: NodeContext) => { [key: string]: any });
}

export interface ComponentNode extends BaseNode {
    /** A Svelte component */
    component: any;

    /** Props to pass to the component */
    props?: { [key: string]: any } | ((context: NodeContext) => { [key: string]: any });

    /** Single item node description to use for list based nodes */
    item?: TemplateNode;
}

export interface SwitchNode {
    if: {
        test: (context: NodeContext) => boolean;
        then: TemplateNode | TemplateNode[];
    };
    elseif?: {
        test: (context: NodeContext) => boolean;
        then: TemplateNode | TemplateNode[];
    };
    else?: TemplateNode | TemplateNode[];
}

export type TemplateNode = ElementNode | ComponentNode | SwitchNode;

export interface NodeTree {
    unwrap: () => void | TemplateNode | TemplateNode[];
    find: (key: string) => NodeTree;
    remove: (key: string) => NodeTree;
    replace: (key: string, ...nodes: (NodeTree | TemplateNode)[]) => NodeTree;
    update: (key: string, updater: (node: TemplateNode) => void) => NodeTree;
    append: (...nodes: (NodeTree | TemplateNode)[]) => NodeTree;
    prepend: (...nodes: (NodeTree | TemplateNode)[]) => NodeTree;
    insert: (index: number, ...nodes: (NodeTree | TemplateNode)[]) => NodeTree;
}

export function nodeTree(tree: void | TemplateNode | TemplateNode[]): NodeTree {
    function find(key: string) {
        if (tree) {
            const node = withNodeByKey(tree, key, (node: TemplateNode) => node);
            return nodeTree(node);
        }
        // no results
        return nodeTree(undefined);
    }

    return {
        unwrap() {
            return tree;
        },
        find,
        remove(key: string) {
            // can't remove
            if (!tree) {
                return nodeTree(undefined);
            }

            withNodeByKey(tree, key, (node: TemplateNode, parent: TemplateNode[]) => {
                const index = parent.indexOf(node);
                parent.splice(index, 1);
                return node;
            });

            // return tree, not node that was removed as we can no longer do anything with it
            return nodeTree(tree);
        },
        replace(key: string, ...nodes: (NodeTree | TemplateNode)[]) {
            // can't remove
            if (!tree) {
                return nodeTree(undefined);
            }

            const unwrappedNodes = nodes.map(unwrap);

            withNodeByKey(tree, key, (node: TemplateNode, parent: TemplateNode[]) => {
                const index = parent.indexOf(node);
                parent.splice(index, 1, ...unwrappedNodes);
                return node;
            });

            // return tree, not node that was removed as we can no longer do anything with it
            return nodeTree(tree);
        },
        update(key: string, updater: (currentProps: TemplateNode) => void) {
            if (!tree) {
                return nodeTree(undefined);
            }
            const hit = find(key);
            if (!hit) {
                return nodeTree(undefined);
            }
            updater(unwrap(hit));
            return hit;
        },
        append(...nodes: (NodeTree | TemplateNode)[]) {
            if (tree) {
                let index = getAppendIndex(tree);
                insertNode(tree, index, nodes);
            }
            return nodeTree(tree);
        },
        prepend(...nodes: (NodeTree | TemplateNode)[]) {
            return nodeTree(tree ? insertNode(tree, 0, nodes) : undefined);
        },
        insert(index: number, ...nodes: (NodeTree | TemplateNode)[]) {
            return nodeTree(tree ? insertNode(tree, index, nodes) : undefined);
        },
    };
}

function unwrap(node: any): TemplateNode {
    return isFunction(node.unwrap) ? node.unwrap() : node;
}

function getAppendIndex(tree: any) {
    if (isArray(tree)) {
        return tree.length;
    }

    if (isArray(tree.children)) {
        return tree.children.length;
    }

    if (tree.if) {
        if (isArray(tree.if.then)) {
            return tree.if.then.length;
        }

        if (isArray(tree.if.then.children)) {
            return tree.if.then.children.length;
        }
    }

    return 0;
}

function insertNode(
    tree: TemplateNode | TemplateNode[],
    index: number,
    nodes: (TemplateNode | NodeTree)[]
) {
    const unwrappedNodes = nodes.map(unwrap);

    // let's go add to array
    if (isArray(tree)) {
        tree.splice(index, 0, ...unwrappedNodes);
    } else {
        // need to add to `then` of switchnode
        if (isSwitchNode(tree)) {
            // no keys set to `then` let's replace
            if (!Object.keys(tree.if.then).length) {
                tree.if.then = unwrappedNodes;
            }
            // @ts-ignore
            else if (!tree.if.then.children) {
                // @ts-ignore
                tree.if.then.children = unwrappedNodes;
            }
            // @ts-ignore
            else if (isArray(tree.if.then.children)) {
                // @ts-ignore
                tree.if.then.children = arrayInsertAtIndex(
                    // @ts-ignore
                    tree.if.then.children,
                    index,
                    ...unwrappedNodes
                );
            }
        }

        // no children yet
        else if (!tree.children) {
            tree.children = unwrappedNodes;
        }

        // has children, add
        else if (isArray(tree.children)) {
            tree.children = arrayInsertAtIndex(tree.children, index, ...unwrappedNodes);
        }
    }

    return unwrappedNodes;
}

function withNodeByKey(
    tree: TemplateNode[] | TemplateNode,
    key: string,
    fn: (node: TemplateNode, tree: TemplateNode[]) => any
): TemplateNode | undefined {
    if (!isArray(tree)) {
        // @ts-ignore
        return tree.key === key ? tree : undefined;
    }

    const subTrees = [];

    for (const node of tree) {
        // @ts-ignore
        if (node.key === key) {
            return fn(node, tree);
        }

        const subTree = getSubTree(node);

        if (subTree.length) {
            subTrees.push(subTree);
        }
    }

    for (const subTree of subTrees) {
        // @ts-ignore
        const node = withNodeByKey(subTree, key, fn);
        if (node) {
            return node;
        }
    }
}

function getSubTree(node: TemplateNode) {
    if (isSwitchNode(node)) {
        return arrayRemoveFalsy([node.if.then, node.elseif?.then, node.else]);
    }

    if (isComponentNode(node) && node.item) {
        return arrayWrap(node.item);
    }

    if (node.children) {
        return arrayWrap(node.children);
    }

    return [];
}

export function isSwitchNode(value: unknown): value is SwitchNode {
    return !!(value && hasOwnProp(value, 'if'));
}

export function isTemplateNode(value: unknown): value is TemplateNode {
    return !!value;
}

export function isComponentNode(value: unknown): value is ComponentNode {
    return !!(value && hasOwnProp(value, 'component'));
}

export function isElementNode(value: unknown): value is ElementNode {
    return !!(value && !hasOwnProp(value, 'component'));
}
