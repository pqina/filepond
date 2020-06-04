export const dropAreaDimensions = {
    height: 0,
    width: 0,
    get getHeight() {
        return this.height;
    },
    set setHeight(val) {
        if (this.height === 0 || val === 0) this.height = val;
    },
    get getWidth() {
        return this.width;
    },
    set setWidth(val) {
        if (this.width === 0 || val === 0) this.width = val;
    },
    setDimensions: function (height, width) {
        if (this.height === 0 || height === 0) this.height = height;
        if (this.width === 0 || width === 0) this.width = width;
    }
};