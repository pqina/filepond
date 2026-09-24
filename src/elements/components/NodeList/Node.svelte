<script lang="ts">
    import { untrack } from 'svelte';
    import { Spring } from 'svelte/motion';
    import {
        isComponentNode,
        isTextNode,
        type NodeData,
        type NodeContext,
        type NodeResources,
        type NodePropResourceMap,
        type TextNode,
        type ComponentNode,
        type ElementNode,
        type TemplateNode,
    } from '../../common/nodeTree.js';
    import type { NodeOptions } from './index.js';
    import { isFunction, isString } from '../../../utils/test.js';
    import { noop, passthrough } from '../../../utils/placeholder.js';
    import { stringReplaceVariables, withResources } from '../../common/string.js';
    import { getSuspensionObserver, isVoidElementTag } from '../../common/dom.js';
    import { EMPTY_OBJECT, isObjectValuesEqual } from '../../../utils/object.js';
    import NodeList from './index.svelte';
    import { EMPTY_ARRAY } from '../../../utils/array.js';

    function computeObjectWithContext(obj: any, dat?: NodeData, ctx?: NodeContext) {
        if (isFunction(obj)) {
            return obj(dat, ctx);
        }

        return obj;
    }

    function computeObjectWithResources(
        obj: any,
        dat: NodeData | undefined,
        ctx: NodeContext | undefined,
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

    let {
        index,
        node,

        // data related
        data,
        context,

        // routes related
        scope,

        // hooks
        beforeRenderNode = passthrough,

        // these props are for animations in the NodeList itself
        reduceMotion = false,
        springOptions,

        // these props are needed so the NodeList can automatically apply locale
        propResourceMap,
        resources,
    }: NodeOptions = $props();

    // handles node suspesion
    const SuspensionObserver = getSuspensionObserver();

    // don't update data if not needed
    let previousData: NodeData | undefined;
    const currentData = $derived.by(() => {
        // no data to deal with
        if (!data) {
            return;
        }

        // this is a very cheap check if these objects are different (doesn't deep compare, doesn't compare object values)
        if (previousData && isObjectValuesEqual(data, previousData)) {
            return previousData;
        }

        previousData = data;
        return previousData;
    });

    // don't update selected data if not needed
    let previousSelectedData: NodeData | undefined;
    const selectedData = $derived.by(() => {
        if (isString(node) || !currentData) {
            return;
        }

        // if we're not going to select data we just pass all of it
        if (!node.data) {
            // remove data
            if (node.data === false) {
                return;
            }
            // pass all data
            return currentData;
        }

        // select the new data for this node and its subtree
        const newlySelectedData = isFunction(node.data)
            ? node.data(currentData, context)
            : { ...currentData, ...(<{ [key: string]: any }>node.data) };

        // this is a very cheap check if these objects are different (doesn't deep compare, doesn't compare object values)
        if (previousSelectedData && isObjectValuesEqual(newlySelectedData, previousSelectedData)) {
            return previousSelectedData;
        }

        previousSelectedData = newlySelectedData;
        return previousSelectedData;
    });

    // determine if we should run Spring related logic (this is not reactive, so springs cannot be defined dynamically)
    const hasSprings = untrack(() => !!node?.spring);

    interface NodeSpring {
        transform: (...args: any[]) => number;
        spring: Spring<any>;
    }

    // the current string state, these are the acive springs and their transforms per key, like: { progress: { spring: Spring, transform: (v) => v } }
    const currentSprings: Record<string, NodeSpring> | null = $state.raw(
        hasSprings
            ? untrack(() => {
                  // we create Springs
                  const res: any = {};
                  const springs = isFunction(node.spring)
                      ? Object.entries(node.spring(EMPTY_OBJECT))
                      : EMPTY_ARRAY;
                  for (const [propertyName, springConfig] of springs) {
                      const { value = null, config, transform = passthrough } = springConfig;
                      res[propertyName] = {
                          transform,
                          spring: new Spring(value, config || springOptions),
                      };
                  }
                  return res;
              })
            : null
    );

    // update springs
    $effect(() => {
        if (!hasSprings || !selectedData || !currentSprings) {
            return;
        }

        const springEntries = isFunction(node.spring)
            ? Object.entries(node.spring(selectedData))
            : EMPTY_ARRAY;

        untrack(() => {
            if (!currentSprings) {
                return;
            }

            // update the springs
            for (const [propertyName, { value }] of springEntries) {
                currentSprings[propertyName].spring.set(value, {
                    instant: reduceMotion,
                });
            }
        });
    });

    // the current spring values, this observes all the springs and then creates an object like: { progress: currentValue }
    let previousSpringData = {};
    const springsData = $derived.by(() => {
        if (!currentSprings) {
            return;
        }

        const currentSpringValues: Record<string, any> = {};

        for (const [key, { spring, transform }] of Object.entries(currentSprings)) {
            currentSpringValues[key] = transform(spring.current);
        }

        if (isObjectValuesEqual(currentSpringValues, previousSpringData)) {
            return previousSpringData;
        }

        previousSpringData = currentSpringValues;
        return currentSpringValues;
    });

    // final data to use
    let previousNodeData = {};
    const nodeDate = $derived.by(() => {
        if (!hasSprings) {
            return selectedData;
        }
        const newNodeData = { ...selectedData, ...springsData };
        if (isObjectValuesEqual(newNodeData, previousNodeData)) {
            return previousNodeData;
        }
        previousNodeData = newNodeData;
        return previousNodeData;
    });

    const computedNode = $derived.by(() => {
        // compute key
        const key = `${node.key ?? index}`;

        const { children, transition } = node;

        // turn string into a text node
        if (isTextNode(node)) {
            return {
                // no need for other props as text nodes are just strings
                children: computeStringWithResources(
                    node.children,
                    nodeDate,
                    resources,
                    propResourceMap
                ),
            } as TextNode;
        }

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

        if (isComponentNode(node)) {
            const { component, item, props } = node;

            return beforeRenderNode(
                {
                    key,
                    component,
                    props: computeObjectWithResources(
                        props,
                        nodeDate,
                        context,
                        resources,
                        propResourceMap
                    ),
                    item,
                    children: children,
                    data: nodeDate,
                    routes: computedRoutes,
                    transition,
                } as any,
                nodeDate,
                context
            ) as ComponentNode;
        }

        // is element node
        const { attrs, item, tag } = node;

        return beforeRenderNode(
            {
                key,
                tag,
                attrs: computeObjectWithResources(
                    attrs,
                    nodeDate,
                    context,
                    resources,
                    propResourceMap
                ),
                item,
                children: children,
                data: nodeDate,
                routes: computedRoutes,
                transition,
            } as any,
            nodeDate,
            context
        ) as ElementNode;
    });

    const computedChildren = $derived(computedNode.children as (string | TemplateNode)[]);

    const computedData = $derived(computedNode.data as NodeData);

    const computedTransition = $derived(computedNode.transition);

    // just for quick testing
    // $effect(() => {
    //     console.log(computedNode.key, computedData);
    // });
</script>

{#if computedNode}
    {#if computedTransition && computedData}
        {#if computedTransition.when(computedData)}
            <svelte:element
                this={'div'}
                transition:computedTransition.fn={computedTransition}
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
                    <!-- when we're rendering an item we don't pass the parent data array, we only use the data that is passed to the item that is being rendered, this ensures the data object doesn't get too big and is scoped per branch of the tree -->
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
                    <!-- when we're rendering a child we merge the current computed data with the child data, the child node can then further narrow the available data, this for example allows springs to pass the current visualRect -->
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
    {:else}
        {computedChildren}
    {/if}
{/snippet}
