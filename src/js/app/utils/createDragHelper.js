export const createDragHelper = (items) => {
    const itemIds = items.map(item => item.id);
    let prevIndex = undefined;
    return {
        setIndex: (index) => {
            prevIndex = index;
        },
        getIndex: () => prevIndex,
        getItemIndex: (item) => itemIds.indexOf(item.id)
    }
}