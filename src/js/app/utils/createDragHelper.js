export const createDragHelper = (items) => {
    const itemIds = items.map(item => item.id);
    let prevIndex = undefined;
    let isDragging = false;
    return {
        setIndex: (index) => {
            prevIndex = index;
            isDragging = true;
        },
        resetDragging: () => {
            isDragging = false;
        },
        getIndex: () => prevIndex,
        getItemIndex: (item) => itemIds.indexOf(item.id),
        isDragging: () => isDragging
    }
}