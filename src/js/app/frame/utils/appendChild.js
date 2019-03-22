export const appendChild = parent => (child, index) => {
    if (typeof index !== 'undefined' && parent.children[index]) {
        parent.insertBefore(child, parent.children[index]);
    } else {
        parent.appendChild(child);
    }
};
