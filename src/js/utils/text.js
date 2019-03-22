export const text = (node, value) => {
    let textNode = node.childNodes[0];
    if (!textNode) {
        textNode = document.createTextNode(value);
        node.appendChild(textNode);
    } else if (value !== textNode.nodeValue) {
        textNode.nodeValue = value;
    }
};
