export const updateRect = (rect = {}, element = {}, style = {}) => {

    if (!element.layoutCalculated) {
        rect.paddingTop = parseInt(style.paddingTop, 10) || 0;
        rect.marginTop = parseInt(style.marginTop, 10) || 0;
        rect.marginRight = parseInt(style.marginRight, 10) || 0;
        rect.marginBottom = parseInt(style.marginBottom, 10) || 0;
        rect.marginLeft = parseInt(style.marginLeft, 10) || 0;
        element.layoutCalculated = true;
    }

    rect.left = element.offsetLeft || 0;
    rect.top = element.offsetTop || 0;
    rect.width = element.offsetWidth || 0;
    rect.height = element.offsetHeight || 0;

    rect.right = rect.left + rect.width;
    rect.bottom = rect.top + rect.height;

    rect.scrollTop = element.scrollTop;

    rect.hidden = element.offsetParent === null;

    return rect;
};
