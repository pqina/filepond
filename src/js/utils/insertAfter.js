export const insertAfter = (newNode, referenceNode) => {
    return referenceNode.parentNode.insertBefore(
        newNode,
        referenceNode.nextSibling
    );
};
