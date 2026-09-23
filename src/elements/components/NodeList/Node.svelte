<script lang="ts">
    import { tick, untrack } from 'svelte';
    import { Spring } from 'svelte/motion';
    import {
        isComponentNode,
        isElementNode,
        type NodeData,
        type NodeContext,
        type NodeResources,
        type NodePropResourceMap,
        type ElementNode,
        type ComponentNode,
        type TextNode,
    } from '../../common/nodeTree.js';
    import type { NodeOptions } from './index.js';
    import { isFunction, isString } from '../../../utils/test.js';
    import { noop, passthrough } from '../../../utils/placeholder.js';
    import { stringReplaceVariables, withResources } from '../../common/string.js';
    import { getSuspensionObserver, isVoidElementTag } from '../../common/dom.js';
    import NodeList from './index.svelte';
    import { isObjectValuesEqual } from '../../../utils/object.js';

    let {
        index,
        node,
        scope,
        data,
        context = {},
        beforeRenderNode = passthrough,
        reduceMotion = false,
        springOptions,
        propResourceMap,
        resources,
    }: NodeOptions = $props();

    // handles node suspesion
    const SuspensionObserver = getSuspensionObserver();

    // determine if we should run spring logic
    const hasSprings = untrack(() => !!node?.spring);

    const springState: Record<
        string,
        {
            transform: (...args: any[]) => number;
            spring: Spring<any>;
        }
    > | null = $state(hasSprings ? {} : null);

    const springValues = $derived.by(() => {
        if (!springState) {
            return;
        }

        const values: Record<string, any> = {};

        for (const [key, { spring, transform }] of Object.entries(springState)) {
            values[key] = transform(spring.current);
        }

        return values;
    });

    const springedNodeData = $derived.by(() => {
        if (!springValues) {
            return;
        }

        return {
            ...data,
            ...springValues,
        };
    });

    function computeObjectWithContext(obj: any, dat: NodeData | undefined, ctx: NodeContext) {
        if (isFunction(obj)) {
            return obj(dat, ctx);
        }

        return obj;
    }

    function computeObjectWithResources(
        obj: any,
        dat: NodeData | undefined,
        ctx: NodeContext,
        nodeResources: NodeResources,
        resourceMap: NodePropResourceMap
    ) {
        if (!obj) {
            return;
        }

        const computedObject = computeObjectWithContext(obj, dat, ctx);

        return withResources(computedObject, resourceMap, nodeResources);
    }

    function computeStringWithResources(
        str: string,
        dat: any,
        nodeResources: NodeResources,
        resourceMap: NodePropResourceMap
    ) {
        const { label } = withResources({ label: str }, resourceMap, nodeResources);

        if (!label.includes('{{')) {
            return label;
        }

        return stringReplaceVariables(label, dat, nodeResources.locale);
    }

    let previousData: NodeData | undefined = {};
    const currentData = $derived.by(() => {
        if (hasSprings) {
            return springedNodeData;
        }

        // this is a very cheap check if these objects are different (doesn't deep compare, doesn't compare object values)
        if (isObjectValuesEqual(data, previousData)) {
            return previousData;
        }

        previousData = data;
        return previousData;
    });

    let previousSelectedChildData = {};
    const selectedChildData = $derived.by(() => {
        if (isString(node)) {
            return undefined;
        }

        // if we're not going to select data we just pass all of it
        if (!node.childData) {
            return currentData;
        }

        // this is a very cheap check if these objects are different (doesn't deep compare, doesn't compare object values)
        const newlySelectedChildData = node.childData(currentData);
        if (isObjectValuesEqual(newlySelectedChildData, previousSelectedChildData)) {
            return previousSelectedChildData;
        }

        previousSelectedChildData = newlySelectedChildData;
        return previousSelectedChildData;
    });

    const EMPTY_OBJECT = Object.freeze({});

    const computedNode = $derived.by(() => {
        // console.log('computing node', node.key);

        if (isString(node)) {
            return {
                key: index,
                children: node,
            };
        }

        // compute node springs if needed
        if (isFunction(node.spring)) {
            const springEntries = Object.entries(node.spring(data || EMPTY_OBJECT));

            untrack(() => {
                if (!springState) {
                    return;
                }

                for (const [propertyName, springEntry] of springEntries) {
                    const {
                        value,
                        config,
                        transform = passthrough,
                    } = springEntry as {
                        value: any;
                        config?: any;
                        transform?: (...args: any[]) => number;
                    };

                    if (springState[propertyName]) {
                        springState[propertyName].spring.set(value, {
                            instant: reduceMotion,
                        });
                    } else {
                        springState[propertyName] = {
                            transform,
                            spring: new Spring(value, config || springOptions),
                        };
                    }
                }
            });
        }

        // compute key
        const key = `${node.key ?? index}`;

        const { children, transition } = node;

        // copmute node routes
        let computedRoutes: any;
        untrack(() => {
            const currentRoutes = scope.routes;

            if (key && currentRoutes?.[key]) {
                Object.assign(currentRoutes[key], {
                    getRoot() {
                        return scope.refs[key];
                    },
                });

                computedRoutes = {
                    ...currentRoutes[key],
                };
            }
        });

        const content = isString(children)
            ? computeStringWithResources(children, selectedChildData, resources, propResourceMap)
            : children;

        if (isComponentNode(node)) {
            if (key === 'toggle-playback') {
                console.log(currentData, selectedChildData);
            }

            const { component, item, props } = node;

            return beforeRenderNode(
                {
                    key,
                    component,
                    props: computeObjectWithResources(
                        props,
                        currentData,
                        context,
                        resources,
                        propResourceMap
                    ),
                    item,
                    children: content,
                    data: selectedChildData,
                    routes: computedRoutes,
                    transition,
                } as any,
                currentData || EMPTY_OBJECT,
                context
            );
        }

        if (isElementNode(node)) {
            const { attrs, item, tag } = node;

            return beforeRenderNode(
                {
                    key,
                    tag,
                    attrs: computeObjectWithResources(
                        attrs,
                        currentData,
                        context,
                        resources,
                        propResourceMap
                    ),
                    item,
                    children: content,
                    data: selectedChildData,
                    routes: computedRoutes,
                    transition,
                } as any,
                currentData || EMPTY_OBJECT,
                context
            );
        }
    });

    // @ts-ignore
    const computedChildren = $derived(computedNode?.children);

    // @ts-ignore
    const computedData = $derived(computedNode?.data);
</script>

{#if computedNode}
    {#if computedNode.transition}
        {#if computedNode.transition.when(computedNode.data)}
            <svelte:element
                this={'div'}
                transition:computedNode.transition.fn={computedNode.transition}
                onoutrostart={(event) => {
                    SuspensionObserver.suspend(event.currentTarget);
                }}
            >
                {@render renderNode(computedNode)}
            </svelte:element>
        {/if}
    {:else}
        {@render renderNode(computedNode)}
    {/if}
{/if}

{#snippet renderNode(n: any)}
    {#if n.component}
        {@const Component = n.component}
        <Component
            {...n.props}
            {...n.routes}
            subNodeListProps={{
                data: computedData,
                routes: scope.routes,
                context,
                beforeRenderNode,
                springOptions,
                reduceMotion,
                propResourceMap,
                resources,
            }}
            bind:this={
                noop,
                function (ref) {
                    n.props?.onmount?.(ref);
                    scope.refs[n.key] = ref;
                }
            }
        >
            {#snippet children(childData: NodeData)}
                {#if n.item}
                    <NodeList
                        {reduceMotion}
                        {springOptions}
                        {propResourceMap}
                        {resources}
                        {context}
                        {beforeRenderNode}
                        nodes={[n.item]}
                        data={childData}
                        routes={undefined}
                    />
                {:else}
                    <NodeList
                        {reduceMotion}
                        {springOptions}
                        {propResourceMap}
                        {resources}
                        {context}
                        {beforeRenderNode}
                        nodes={computedChildren}
                        data={{ ...computedData, ...childData }}
                        routes={scope.routes}
                    />
                {/if}
            {/snippet}
        </Component>
    {:else if n.tag}
        {#if isVoidElementTag(n.tag)}
            <svelte:element
                this={n.tag}
                {...n.attrs}
                {...n.routes}
                bind:this={
                    noop,
                    function (ref) {
                        n.attrs?.onconnected?.(ref);
                        scope.refs[n.key] = ref;
                    }
                }
            />
        {:else}
            <svelte:element
                this={n.tag}
                {...n.attrs}
                {...n.routes}
                bind:this={
                    noop,
                    function (ref) {
                        n.attrs?.onconnected?.(ref);
                        scope.refs[n.key] = ref;
                    }
                }
            >
                {#if n.item}
                    {#each computedData.items as itemData}
                        <NodeList
                            {reduceMotion}
                            {springOptions}
                            {propResourceMap}
                            {resources}
                            {context}
                            {beforeRenderNode}
                            nodes={n.item}
                            data={itemData}
                            routes={scope.routes}
                        />
                    {/each}
                {:else if computedChildren}
                    <NodeList
                        {reduceMotion}
                        {springOptions}
                        {propResourceMap}
                        {resources}
                        {context}
                        {beforeRenderNode}
                        nodes={computedChildren}
                        data={computedData}
                        routes={scope.routes}
                    />
                {/if}
            </svelte:element>
        {/if}
    {:else if computedChildren}
        {computedChildren}
    {/if}
{/snippet}
