export const getRootNode = element =>
    'getRootNode' in element ? element.getRootNode() : document;
