export const getViewRect = (elementRect, childViews, offset, scale) => {
    const left = offset[0] || elementRect.left;
    const top = offset[1] || elementRect.top;
    const right = left + elementRect.width;
    const bottom = top + elementRect.height * (scale[1] || 1);

    const rect = {
        // the rectangle of the element itself
        element: {
            ...elementRect
        },

        // the rectangle of the element expanded to contain its children, does not include any margins
        inner: {
            left: elementRect.left,
            top: elementRect.top,
            right: elementRect.right,
            bottom: elementRect.bottom
        },

        // the rectangle of the element expanded to contain its children including own margin and child margins
        // margins will be added after we've recalculated the size
        outer: {
            left,
            top,
            right,
            bottom
        }
    };

    // expand rect to fit all child rectangles
    childViews
        .filter(childView => !childView.isRectIgnored())
        .map(childView => childView.rect)
        .forEach(childViewRect => {
            expandRect(rect.inner, { ...childViewRect.inner });
            expandRect(rect.outer, { ...childViewRect.outer });
        });

    // calculate inner width and height
    calculateRectSize(rect.inner);

    // append additional margin (top and left margins are included in top and left automatically)
    rect.outer.bottom += rect.element.marginBottom;
    rect.outer.right += rect.element.marginRight;

    // calculate outer width and height
    calculateRectSize(rect.outer);

    return rect;
};

const expandRect = (parent, child) => {
    // adjust for parent offset
    child.top += parent.top;
    child.right += parent.left;
    child.bottom += parent.top;
    child.left += parent.left;

    if (child.bottom > parent.bottom) {
        parent.bottom = child.bottom;
    }

    if (child.right > parent.right) {
        parent.right = child.right;
    }
};

const calculateRectSize = rect => {
    rect.width = rect.right - rect.left;
    rect.height = rect.bottom - rect.top;
};
