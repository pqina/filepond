export const removeChildView = (parent, childViews) => view => {
    // remove from child views
    childViews.splice(childViews.indexOf(view), 1);

    // remove the element
    if (view.element.parentNode) {
        parent.removeChild(view.element);
    }

    return view;
};
