/** Wraps SVG shapes in a 24x24 viewBox */
export function createDefaultIcon(shapes: string, options?: { title: string }): string | null {
    if (!shapes) {
        return null;
    }

    const { title } = options ?? {};

    return `<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-linecap="round">${
        title ? `<title>${title}</title>` : ''
    }${shapes}</svg>`;
}
