<script lang="ts">
    import {
        type TemplateNode,
        type NodeContext,
        type SwitchNode,
        isSwitchNode,
        isTemplateNode,
        isComponentNode,
        isElementNode,
    } from '../../common/nodeTree.js';
    import { type Component, untrack } from 'svelte';
    import { type Locale } from '../../../types/index.js';
    import { type NodeListOptions } from './index.js';
    import { isFunction, isString } from '../../../utils/test.js';
    import { stringReplaceVariables, withResources } from '../../common/string.js';
    import { getAppContext } from '../../FilePondEntryList/contexts/appContext.js';
    import {
        // is used
        noop,
        passthrough,
    } from '../../../utils/placeholder.js';
    import { Spring } from 'svelte/motion';
    import { arrayWrap } from '../../../utils/array.js';
    import NodeList from './index.svelte';

    let {
        nodes,
        context: treeContext,
        sharedContext,
        routes: contextRoutes = {},
        beforeSetProps = passthrough,
        beforeRenderNode = passthrough,
    }: NodeListOptions = $props();

    // reference to node instance (element or component)
    const refs: { [node: string]: any } = $state.raw({});

    // get app context map
    const { resources, propResourceMap, enableAnimations } = $derived(getAppContext());

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

    /** The currently computed context (+springs) for the nodes at this level */
    const computedTreeContext = $derived.by(() => {
        if (springValues === null) {
            return treeContext;
        }

        return {
            ...treeContext,
            ...springValues,
        };
    });

    /** Apply context to data */
    function computeObjectWithContext(
        obj:
            | string
            | { [key: string]: any }
            | ((context: NodeContext, sharedContext: NodeContext) => any),
        context: NodeContext
    ) {
        return obj && isFunction(obj) ? obj(context, sharedContext) : obj;
    }

    function computeObjectWithResources(
        obj: { [key: string]: any } | ((context: NodeContext) => any) | undefined,
        context: NodeContext,
        resources: {
            locale: Locale;
            assets: {
                [key: string]: string;
            };
        }
    ) {
        if (!obj) {
            return;
        }

        const computedObject = computeObjectWithContext(obj, context);

        return withResources(computedObject, propResourceMap, resources);
    }

    function computeStringWithResources(
        str: string,
        context: NodeContext,
        resources: {
            locale: Locale;
            assets: {
                [key: string]: string;
            };
        }
    ) {
        // auto replace props (label, icon, title) in string with locale values
        let { label } = withResources({ label: str }, propResourceMap, resources);

        // test if might have to replace variables
        if (label.includes('{')) {
            const resultingContext = context
                ? computeObjectWithContext(context, { ...computedTreeContext })
                : computedTreeContext;

            return stringReplaceVariables(label, resultingContext);
        }

        return label;
    }

    function computeSwitchNode(node: SwitchNode, context: NodeContext) {
        if (isFunction(node.if.test) && node.if.test(context)) {
            return arrayWrap(node.if.then);
        }

        if (node.elseif && isFunction(node.elseif.test) && node.elseif.test(context)) {
            return arrayWrap(node.elseif.then);
        }

        if (isTemplateNode(node.else)) {
            return arrayWrap(node.else);
        }

        return [];
    }

    function computeSwitchNodes(node: SwitchNode, context: NodeContext) {
        let outputNodes: TemplateNode[] = [];
        for (const computedNode of computeSwitchNode(node, context)) {
            if (isSwitchNode(computedNode)) {
                outputNodes.push(...computeSwitchNodes(computedNode, context));
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
                const nodes = computeSwitchNodes(node, treeContext);
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

        return preparedNodes
            .map((node, index) => {
                // convert strings to nodes so they can be used in #each, if item is a string we use index as key
                if (isString(node)) {
                    return {
                        key: index,
                        content: node,
                    };
                }

                // handle springed context data
                if (isTemplateNode(node) && isFunction(node.spring)) {
                    const springEntries = Object.entries(node.spring(treeContext));
                    untrack(() => {
                        springEntries.forEach(
                            ([propertyName, { value, config, transform = passthrough }]) => {
                                // update value spring
                                if (springState[propertyName]) {
                                    springState[propertyName].spring.set(value, {
                                        instant: !enableAnimations,
                                    });
                                }

                                // create value spring
                                else {
                                    springState[propertyName] = {
                                        transform,
                                        spring: new Spring(value, config),
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
                    context: nodeContext,
                } = node;

                // merge routes
                if (nodeRoutes) {
                    untrack(() => {
                        Object.assign(
                            contextRoutes,
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
                    if (key && contextRoutes?.[key]) {
                        Object.assign(contextRoutes[key], {
                            getRoot() {
                                return refs[key];
                            },
                        });

                        computedRoutes = {
                            ...contextRoutes[key],
                        };
                    }
                });

                const computedNodeContext = nodeContext
                    ? computeObjectWithContext(nodeContext, computedTreeContext)
                    : computedTreeContext;

                const mergedNodeContext = {
                    ...computedTreeContext,
                    ...computedNodeContext,
                };

                const content = isString(children)
                    ? computeStringWithResources(children, mergedNodeContext, resources)
                    : children;

                if (isComponentNode(node)) {
                    const { component, item, props } = node;
                    return beforeRenderNode(
                        {
                            key: key ?? index,
                            Component: component,
                            props: computeObjectWithResources(props, mergedNodeContext, resources),
                            item,
                            content,
                            context: mergedNodeContext,
                            transition,
                            routes: computedRoutes,
                        },
                        treeContext,
                        sharedContext
                    );
                }

                if (isElementNode(node)) {
                    const { attrs, tag } = node;
                    return beforeRenderNode(
                        {
                            key: key ?? index,
                            tag,
                            attrs: computeObjectWithResources(attrs, mergedNodeContext, resources),
                            content,
                            context: mergedNodeContext,
                            transition,
                            routes: computedRoutes,
                        },
                        treeContext,
                        sharedContext
                    );
                }
            })
            .filter(Boolean);
    });
</script>

{#each computedNodes as { key, tag, attrs, Component, props, content, context, routes, item, transition } (key)}
    {#if transition}
        {#if transition.when(context)}
            <svelte:element this={'div'} transition:transition.fn={transition}>
                {@render node(key, tag, attrs, Component, props, content, context, routes, item)}
            </svelte:element>
        {/if}
    {:else}
        {@render node(key, tag, attrs, Component, props, content, context, routes, item)}
    {/if}
{/each}

{#snippet node(
    key: string,
    tag: string,
    attrs: { [key: string]: string },
    Component: Component,
    props: { [key: string]: any },
    content: TemplateNode[],
    context: NodeContext,
    routes: { [key: string]: string },
    item: any
)}
    {#if Component}
        <Component
            {...beforeSetProps(props)}
            {...routes}
            nodeContext={{
                context,
                routes: contextRoutes,
                sharedContext,
                beforeSetProps,
                beforeRenderNode,
            }}
            bind:this={
                noop,
                function (ref) {
                    refs[key] = ref;
                }
            }
        >
            {#snippet children(childrenProps: any)}
                <!-- if we'er rendering an item, we only pass children props for now -->
                <NodeList
                    nodes={item ? [item] : content}
                    context={item ? childrenProps : { ...context, ...childrenProps }}
                    routes={item ? {} : contextRoutes}
                    {sharedContext}
                    {beforeSetProps}
                    {beforeRenderNode}
                />
            {/snippet}
        </Component>
    {:else if tag}
        <svelte:element
            this={tag}
            {...attrs}
            {...routes}
            bind:this={
                noop,
                function (ref) {
                    refs[key] = ref;
                }
            }
        >
            {#if content}
                <NodeList
                    nodes={content}
                    {context}
                    routes={contextRoutes}
                    {sharedContext}
                    {beforeSetProps}
                    {beforeRenderNode}
                />
            {/if}
        </svelte:element>
    {:else if content}
        {content}
    {/if}
{/snippet}
