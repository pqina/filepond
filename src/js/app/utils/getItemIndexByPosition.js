export const getItemIndexByPosition = (view, children, positionInView) => {

    if (!positionInView) return;

    const horizontalSpace = view.rect.element.width;
    // const children = view.childViews;
    const l = children.length;
    let last = null;

    // -1, don't move items to accomodate (either add to top or bottom)
    if (l === 0 || positionInView.top < children[0].rect.element.top) return -1;

    // let's get the item width
    const item = children[0];
    const itemRect = item.rect.element;
    const itemHorizontalMargin = itemRect.marginLeft + itemRect.marginRight;
    const itemWidth = itemRect.width + itemHorizontalMargin;
    const itemsPerRow = Math.round(horizontalSpace / itemWidth);

    // stack
    if (itemsPerRow === 1) {
        for (let index=0; index<l; index++) {
            const child = children[index];
            const childMid = child.rect.outer.top + (child.rect.element.height * .5);
            if (positionInView.top < childMid) {
                return index;
            }
        }
        return l;
    }

    // grid
    const itemVerticalMargin = itemRect.marginTop + itemRect.marginBottom;
    const itemHeight = itemRect.height + itemVerticalMargin;
    for (let index=0; index<l; index++) {
        
        const indexX = (index % itemsPerRow);
        const indexY = Math.floor(index / itemsPerRow);

        const offsetX = indexX * itemWidth;
        const offsetY = indexY * itemHeight;

        const itemTop = offsetY - itemRect.marginTop;
        const itemRight = offsetX + itemWidth;
        const itemBottom = offsetY + itemHeight + itemRect.marginBottom;
        
        if (positionInView.top < itemBottom && positionInView.top > itemTop) {
            if (positionInView.left < itemRight) {
                return index;
            }
            else if (index !== l - 1) {
                last = index;
            }
            else {
                last = null;
            }
        }

    }

    if (last !== null) {
        return last;
    }

    return l;
};