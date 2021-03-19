export default (horizontalSpace, itemWidth) => {
    // add one pixel leeway, when using percentages for item width total items can be 1.99 per row

    return Math.max(1, Math.floor((horizontalSpace + 1) / itemWidth));
};
