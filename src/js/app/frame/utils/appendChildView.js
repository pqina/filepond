export const appendChildView = (parent, childViews) => (view, index) => {
    
    if (typeof index !== 'undefined') {
        childViews.splice(index, 0, view);
    } else {
        childViews.push(view);
    }
    
    return view;
};
