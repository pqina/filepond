const uuid = require('uuid/v4');

// needed because jest doesn't have CSS on window
if (!window.CSS) window.CSS = {};
window.CSS.supports = () => true;

window.URL.createObjectURL = blob => {
    return `blob:${serializeURL(location.origin)}/${uuid()}`;
};

window.URL.revokeObjectURL = url => {};
