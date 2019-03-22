const uuid = require('uuid/v4');

window.URL.createObjectURL = (blob) => {
    return `blob:${serializeURL(location.origin)}/${uuid()}`;
}

window.URL.revokeObjectURL = (url) => {}

// var _createObjectURL = window.URL.createObjectURL;
// Object.defineProperty(window.URL, 'createObjectURL', {
//     set: function (value) {
//         console.trace('set createObjectURL')
//         _createObjectURL = value;
//     },
//     get: function () {
//         console.trace('get createObjectURL')
//         return _createObjectURL;
//     }
// })

// var _URL = window.URL;
// Object.defineProperty(window, 'URL', {
//     set: function (value) {
//         console.trace('set URL')
//         _URL = value;
//     },
//     get: function () {
//         console.trace('get URL')
//         return _URL;
//     }
// })