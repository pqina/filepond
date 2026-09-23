const cache = new Map();
export function svgElement({ svg }: { svg: string }) {
    let el = cache.get(svg);

    if (!el) {
        const frag = document.createElement('div');
        frag.innerHTML = svg;
        el = frag.children[0];
        cache.set(svg, el);
    }

    return (element: HTMLElement) => {
        const ref = el.cloneNode(true) as HTMLElement;

        element.append(ref);

        return () => {
            ref?.remove();
        };
    };
}
