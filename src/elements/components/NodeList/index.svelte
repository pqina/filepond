<script lang="ts">
    import { untrack } from 'svelte';
    import {
        isSwitchNode,
        isTemplateNode,
        type SwitchNode,
        type NodeData,
    } from '../../common/nodeTree.js';
    import type { NodeListOptions } from './index.js';
    import { isFunction, isString } from '../../../utils/test.js';
    import { passthrough } from '../../../utils/placeholder.js';
    import { arrayRemoveFalsy, arrayWrap } from '../../../utils/array.js';
    import Node from './Node.svelte';
    import { yieldScheduler } from '../../../common/yield.js';

    // for when no data
    const EMPTY_OBJECT = Object.freeze({});

    let {
        nodes,
        data,
        context = {},
        routes: currentRoutes,
        beforeRenderNode = passthrough,
        reduceMotion = false,
        springOptions,
        propResourceMap,
        resources,
    }: NodeListOptions = $props();

    // shared refs
    const refs: Record<string, any> = $state.raw({});

    // Shared by siblings so routes can resolve other nodes' instances.
    const scope = {
        refs,
        get routes(): any {
            return currentRoutes;
        },
    };

    function computeSwitchNode(node: SwitchNode, dat: NodeData | undefined) {
        if (isFunction(node.if.test) && node.if.test(dat || EMPTY_OBJECT)) {
            return arrayWrap(node.if.then);
        }

        if (node.elseif && isFunction(node.elseif.test) && node.elseif.test(dat || EMPTY_OBJECT)) {
            return arrayWrap(node.elseif.then);
        }

        if (isTemplateNode(node.else)) {
            return arrayWrap(node.else);
        }

        return [];
    }

    function computeSwitchNodes(node: SwitchNode, dat: NodeData | undefined): any[] {
        const outputNodes: any[] = [];

        for (const computedNode of computeSwitchNode(node, dat)) {
            if (isSwitchNode(computedNode)) {
                outputNodes.push(...computeSwitchNodes(computedNode, dat));
            } else {
                outputNodes.push(computedNode);
            }
        }

        return outputNodes;
    }

    function getNodeKey(node: any, index: number): string | number {
        return isString(node) ? index : `${node.key ?? index}`;
    }

    const computedNodes: any[] = $derived.by(() => {
        const preparedNodes: any[] = [];

        // figure out which nodes to render
        for (const node of arrayWrap(nodes)) {
            if (!node) {
                continue;
            }

            if (isSwitchNode(node)) {
                preparedNodes.push(...computeSwitchNodes(node, data));
            } else {
                preparedNodes.push(node);
            }
        }

        // compute routes
        untrack(() => {
            for (const node of preparedNodes) {
                // no routes to compute
                if (isString(node) || !node.routes) {
                    continue;
                }

                // init routes
                if (!currentRoutes) {
                    currentRoutes = {};
                }

                // add new routes to the existing routes object
                Object.assign(
                    currentRoutes,
                    Object.entries(node.routes).reduce((prev: any, [origin, target]) => {
                        const [dispatcherKey, eventType] = origin.split(':');
                        const [targetKey, fnName] = (target as string).split('.');

                        prev[targetKey] = {};
                        prev[dispatcherKey] = {
                            [`on${eventType}`]: (...args: any[]) => {
                                const target = prev[targetKey];
                                const targetRoot = target.getRoot();
                                targetRoot[fnName]?.(...args);
                            },
                        };

                        return prev;
                    }, {})
                );
            }
        });

        return arrayRemoveFalsy(preparedNodes);
    });
</script>

{#each computedNodes as node, index (getNodeKey(node, index))}
    <!-- if we're rendering lots of nodes we give main thread some room in between nodes -->
    {#await yieldScheduler() then}
        <Node
            {node}
            {index}
            {scope}
            {data}
            {context}
            {beforeRenderNode}
            {reduceMotion}
            {springOptions}
            {propResourceMap}
            {resources}
        />
    {/await}
{/each}
