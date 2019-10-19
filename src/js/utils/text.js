export const text = (node, value) => {
    let textNode = null;
    node.childNodes.forEach((el) => {
      if(el.tagName === undefined){
        textNode = el
      }
    })
    if (!textNode) {
        textNode = document.createTextNode(value);
        node.appendChild(textNode);
    } else if (value !== textNode.nodeValue) {
        textNode.nodeValue = value;
    }
};
