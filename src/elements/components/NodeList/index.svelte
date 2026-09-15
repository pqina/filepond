<script lang="ts">
    import {
        type TemplateNode,
        type ComponentNode,
        type NodeContext,
        type SwitchNode,
        isSwitchNode,
        isTemplateNode,
        isComponentNode,
        isElementNode,
        type ElementNode,
        type NodeData,
        type NodeResources,
        type NodePropResourceMap,
    } from '../../common/nodeTree.js';
    import { type Component, untrack } from 'svelte';
    import { type NodeListOptions } from './index.js';
    import { isFunction, isString } from '../../../utils/test.js';
    import { stringReplaceVariables, withResources } from '../../common/string.js';
    import {
        // is used
        noop,
        passthrough,
    } from '../../../utils/placeholder.js';
    import { Spring } from 'svelte/motion';
    import { arrayWrap } from '../../../utils/array.js';
    import NodeList from './index.svelte';
    import { getSuspensionObserver, isVoidElementTag } from '../../common/dom.js';

    let {
        nodes,
        data = {},
        context = {},
        routes: currentRoutes = {},
        beforeSetProps = passthrough,
        beforeRenderNode = passthrough,
        reduceMotion = false,
        springOptions,
    }: NodeListOptions = $props();

    // reference to node instance (element or component)
    const refs: { [node: string]: any } = $state.raw({});

    /** The currently computed context (+springs) for the nodes at this level */
    const springState: {
        [key: string]: {
            transform: (...args: any[]) => number;
            spring: Spring<any>;
        };
    } = $state({});
    const springValues = $derived.by(() => {
        return springState
            ? Object.entries(springState).reduce((current, [key, { spring, transform }]) => {
                  // @ts-ignore
                  current[key] = transform(spring.current);
                  return current;
              }, {})
            : null;
    });
    const springedNodeData = $derived.by(() => {
        if (springValues === null) {
            return data;
        }

        return {
            ...data,
            ...springValues,
        };
    });

    /** Apply context to data */
    function computeObjectWithContext(
        obj: string | { [key: string]: any } | ((dat: NodeData, ctx: NodeContext) => any),
        dat: NodeData,
        ctx: NodeContext
    ) {
        return obj && isFunction(obj) ? obj(dat, ctx) : obj;
    }

    function computeObjectWithResources(
        obj: { [key: string]: any } | ((dat: NodeContext) => any) | undefined,
        dat: NodeContext,
        ctx: NodeContext
    ) {
        if (!obj) {
            return;
        }

        if (!isResourceMap(ctx.propResourceMap) || !isResources(ctx.resources)) {
            return;
        }

        const computedObject = computeObjectWithContext(obj, dat, ctx);

        return withResources(computedObject, ctx.propResourceMap, ctx.resources);
    }

    function isResources(value: any): value is NodeResources {
        return !!value;
    }

    function isResourceMap(value: any): value is NodePropResourceMap {
        return !!value;
    }

    function computeStringWithResources(str: string, dat: NodeData, ctx: NodeContext) {
        if (!isResourceMap(ctx.propResourceMap) || !isResources(ctx.resources)) {
            return str;
        }

        // auto replace props (label, icon, title) in string with locale values
        let { label } = withResources({ label: str }, ctx.propResourceMap, ctx.resources);

        // test if we have to replace variables
        if (label.includes('{{')) {
            const resultingData = dat
                ? computeObjectWithContext(dat, { ...springedNodeData }, ctx)
                : springedNodeData;

            return stringReplaceVariables(label, resultingData, ctx.resources.locale);
        }

        return label;
    }

    function computeSwitchNode(node: SwitchNode, dat: NodeData) {
        if (isFunction(node.if.test) && node.if.test(dat)) {
            return arrayWrap(node.if.then);
        }

        if (node.elseif && isFunction(node.elseif.test) && node.elseif.test(dat)) {
            return arrayWrap(node.elseif.then);
        }

        if (isTemplateNode(node.else)) {
            return arrayWrap(node.else);
        }

        return [];
    }

    function computeSwitchNodes(node: SwitchNode, dat: NodeData) {
        let outputNodes: TemplateNode[] = [];
        for (const computedNode of computeSwitchNode(node, dat)) {
            if (isSwitchNode(computedNode)) {
                outputNodes.push(...computeSwitchNodes(computedNode, dat));
            } else {
                outputNodes.push(computedNode);
            }
        }
        return outputNodes;
    }

    // compute nodes
    const computedNodes: any[] = $derived.by(() => {
        const preparedNodes = [];

        for (const node of arrayWrap(nodes)) {
            // remove falsy items and items that shouldn't render for this context
            if (!node) {
                continue;
            }

            // handle switches
            if (isSwitchNode(node)) {
                const nodes = computeSwitchNodes(node, data);
                preparedNodes.push(...nodes);
                continue;
            }

            // skips strings
            if (isString(node)) {
                preparedNodes.push(node);
                continue;
            }

            preparedNodes.push(node);
        }

        function getNodeKey(key: string | undefined, index: number): string {
            return `${key ?? index}`;
        }

        return preparedNodes
            .map((node, index) => {
                // convert strings to nodes so they can be used in #each, if item is a string we use index as key
                if (isString(node)) {
                    return {
                        key: index,
                        children: node,
                    };
                }

                // handle springed context data
                if (!isSwitchNode(node) && isFunction(node.spring)) {
                    const springEntries = Object.entries(node.spring(data));
                    untrack(() => {
                        springEntries.forEach(
                            ([propertyName, { value, config, transform = passthrough }]) => {
                                // update value spring
                                if (springState[propertyName]) {
                                    springState[propertyName].spring.set(value, {
                                        instant: reduceMotion,
                                    });
                                }

                                // create value spring
                                else {
                                    springState[propertyName] = {
                                        transform,
                                        spring: new Spring(value, config || springOptions),
                                    };
                                }
                            }
                        );
                    });
                }

                const {
                    key,
                    routes: nodeRoutes,
                    children,
                    transition,
                    data: bareNodeData,
                } = node as ComponentNode | ElementNode;

                // merge routes
                if (nodeRoutes) {
                    untrack(() => {
                        Object.assign(
                            currentRoutes,
                            Object.entries(nodeRoutes).reduce(
                                (prev: any, [origin, target]: [string, string]) => {
                                    const [dispatcherkey, eventType] = origin.split(':');
                                    const [targetKey, fnName] = target.split('.');
                                    prev[targetKey] = {};
                                    prev[dispatcherkey] = {
                                        [`on${eventType}`]: (...args: any) => {
                                            const target = prev[targetKey];
                                            const targetRoot = target.getRoot();
                                            targetRoot[fnName]?.(...args);
                                        },
                                    };
                                    return prev;
                                },
                                {}
                            )
                        );
                    });
                }

                // determine routes
                let computedRoutes = {};
                untrack(() => {
                    if (key && currentRoutes?.[key]) {
                        Object.assign(currentRoutes[key], {
                            getRoot() {
                                return refs[key];
                            },
                        });

                        computedRoutes = {
                            ...currentRoutes[key],
                        };
                    }
                });

                const mergedNodeData = bareNodeData
                    ? computeObjectWithContext(bareNodeData, springedNodeData, context)
                    : springedNodeData;

                const computedNodeData = {
                    ...springedNodeData,
                    ...mergedNodeData,
                };

                const content = isString(children)
                    ? computeStringWithResources(children, computedNodeData, context)
                    : children;

                if (isComponentNode(node)) {
                    const { component, item, props } = node;
                    return beforeRenderNode(
                        {
                            key: getNodeKey(key, index),
                            component,
                            props: beforeSetProps(
                                computeObjectWithResources(props, computedNodeData, context)
                            ),
                            item,
                            children: content,
                            data: computedNodeData,
                            routes: computedRoutes,
                            transition,
                        },
                        data,
                        context
                    );
                }

                if (isElementNode(node)) {
                    const { attrs, item, tag } = node;
                    return beforeRenderNode(
                        {
                            key: getNodeKey(key, index),
                            tag,
                            attrs: computeObjectWithResources(attrs, computedNodeData, context),
                            item,
                            children: content,
                            data: computedNodeData,
                            routes: computedRoutes,
                            transition,
                        },
                        data,
                        context
                    );
                }
            })
            .filter(Boolean);
    });

    // we need this so when a transition outro starts we can mark the transition node as suspended and children of the node can stop measuring
    const SuspensionObserver = getSuspensionObserver();
</script>

{#each computedNodes as { key, tag, attrs, component, props, children, data, routes, item, transition } (key)}
    {#if transition}
        {#if transition?.when(data)}
            <svelte:element
                this={'div'}
                transition:transition.fn={transition}
                onoutrostart={(e) => {
                    SuspensionObserver.suspend(e.currentTarget);
                }}
            >
                {@render node(key, tag, attrs, component, props, children, data, routes, item)}
            </svelte:element>
        {/if}
    {:else}
        {@render node(key, tag, attrs, component, props, children, data, routes, item)}
    {/if}
{/each}

{#snippet node(
    key: string,
    tag: string,
    attrs: { [key: string]: string },
    Component: Component,
    props: { [key: string]: any },
    content: TemplateNode[],
    data: NodeData,
    routes: { [key: string]: string },
    item: any
)}
    {#if Component}
        <Component
            {...props}
            {...routes}
            subNodeListProps={{
                /* for when a component renders a NodeList */
                data,
                context,
                routes: currentRoutes,
                beforeSetProps,
                beforeRenderNode,
            }}
            bind:this={
                noop,
                function (ref) {
                    props?.onmount?.(ref);
                    refs[key] = ref;
                }
            }
        >
            {#snippet children(childrenProps: any)}
                <!-- if we'er rendering an item, we only pass children props for now -->
                <NodeList
                    {reduceMotion}
                    {springOptions}
                    nodes={item ? [item] : content}
                    data={beforeSetProps(item ? childrenProps : { ...data, ...childrenProps })}
                    routes={item ? {} : currentRoutes}
                    {context}
                    {beforeSetProps}
                    {beforeRenderNode}
                />
            {/snippet}
        </Component>
    {:else if tag}
        {#if isVoidElementTag(tag)}
            <svelte:element
                this={tag}
                {...attrs}
                {...routes}
                bind:this={
                    noop,
                    function (ref) {
                        // @ts-ignore
                        attrs?.onconnected?.(ref);
                        refs[key] = ref;
                    }
                }
            />
        {:else}
            <svelte:element
                this={tag}
                {...attrs}
                {...routes}
                bind:this={
                    noop,
                    function (ref) {
                        // @ts-ignore
                        attrs?.onconnected?.(ref);
                        refs[key] = ref;
                    }
                }
            >
                {#if item}
                    {#each data.items as itemData}
                        <NodeList
                            {reduceMotion}
                            {springOptions}
                            nodes={item}
                            data={itemData}
                            routes={currentRoutes}
                            {context}
                            {beforeSetProps}
                            {beforeRenderNode}
                        />
                    {/each}
                {:else if content}
                    <NodeList
                        {reduceMotion}
                        {springOptions}
                        nodes={content}
                        {data}
                        routes={currentRoutes}
                        {context}
                        {beforeSetProps}
                        {beforeRenderNode}
                    />
                {/if}
            </svelte:element>
        {/if}
    {:else if content}
        {content}
    {/if}
{/snippet}
