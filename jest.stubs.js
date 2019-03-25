const uuid = require('uuid/v4');

window.URL.createObjectURL = (blob) => {
    return `blob:${serializeURL(location.origin)}/${uuid()}`;
}

window.URL.revokeObjectURL = (url) => {}