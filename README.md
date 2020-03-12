# <img src="https://github.com/pqina/filepond-github-assets/blob/master/logo.svg" height="44" alt="FilePond"/>

A JavaScript library that can upload anything you throw at it, optimizes images for faster uploads, and offers a great, accessible, silky smooth user experience.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/pqina/filepond/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/filepond.svg)](https://www.npmjs.com/package/filepond)

21 KB gzipped. FilePond adapters are available for **[React](https://github.com/pqina/react-filepond)**, **[Vue](https://github.com/pqina/vue-filepond)**, **[Angular](https://github.com/pqina/ngx-filepond)** and **[jQuery](https://github.com/pqina/jquery-filepond)**

FilePond is maintained by **[Rik Schennink](https://twitter.com/rikschennink/)**

<img src="https://github.com/pqina/filepond-github-assets/blob/master/filepond-animation-01.gif?raw=true" width="370" alt=""/>

### Core Features

*   Accepts **directories**, **files**, blobs, local URLs, **remote URLs** and Data URIs.
*   **Drop files**, select on filesystem, **copy and paste files**, or add files using the API.
*   **Async uploads** with AJAX, supports **chunk uploads**, can encode files as base64 data and send along form post.
*   **Accessible**, tested with AT software like VoiceOver and JAWS, **navigable by Keyboard**.
*   **Image optimization**, automatic image resizing, **cropping**, filtering, and **fixes EXIF orientation**.
*   **Responsive**, automatically scales to available space, is functional on both **mobile and desktop devices**.

[Learn more about FilePond](https://pqina.nl/filepond/)

---

### Also need Image Editing?

**Doka.js** is what you're looking for. It's a Modern JavaScript Image Editor, Doka supports setting **crop aspect ratios**, **resizing**, **rotating**, **cropping**, and **flipping** images. Above all, it integrates beautifully with FilePond.

[Learn more about Doka](https://pqina.nl/doka/?ref=github)

<img src="https://github.com/pqina/filepond-github-assets/blob/master/doka.gif?raw=true" width="478" alt=""/>

---

### FilePond Plugins

*   [File encode](https://github.com/pqina/filepond-plugin-file-encode)
*   [File rename](https://github.com/pqina/filepond-plugin-file-rename)
*   [File size validation](https://github.com/pqina/filepond-plugin-file-validate-size)
*   [File type validation](https://github.com/pqina/filepond-plugin-file-validate-type)
*   [File metadata](https://github.com/pqina/filepond-plugin-file-metadata)
*   [File poster](https://github.com/pqina/filepond-plugin-file-poster)
*   [Image editor](https://github.com/pqina/filepond-plugin-image-edit)
*   [Image size validation](https://github.com/pqina/filepond-plugin-image-validate-size)
*   [Image preview](https://github.com/pqina/filepond-plugin-image-preview)
*   [Image crop](https://github.com/pqina/filepond-plugin-image-crop)
*   [Image filter](https://github.com/pqina/filepond-plugin-image-filter)
*   [Image resize](https://github.com/pqina/filepond-plugin-image-resize)
*   [Image transform](https://github.com/pqina/filepond-plugin-image-transform)
*   [Image EXIF orientation](https://github.com/pqina/filepond-plugin-image-exif-orientation)
*   [Image overlay](https://github.com/nielsboogaard/filepond-plugin-image-overlay) (third-party)
*   [Media preview](https://github.com/nielsboogaard/filepond-plugin-media-preview) (third-party)
*   [Get file](https://github.com/nielsboogaard/filepond-plugin-get-file) (third-party)


### Adapters

*   [React](https://github.com/pqina/react-filepond)
*   [Vue](https://github.com/pqina/vue-filepond)
*   [jQuery](https://github.com/pqina/jquery-filepond)
*   [Angular](https://github.com/pqina/ngx-filepond)
*   [Angular 1](https://github.com/johnnyasantoss/angularjs-filepond) (third-party)
*   [Ember](https://github.com/alexdiliberto/ember-filepond) (third-party)


### Backend

*   [PHP](https://github.com/pqina/filepond-boilerplate-php)
*   [Django](https://github.com/ImperialCollegeLondon/django-drf-filepond)  (third-party)
*   [Laravel](https://github.com/Sopamo/laravel-filepond) (third-party)


## Quick Start

Install using npm:

```bash
npm install filepond
```

Then import in your project:

```js
import * as FilePond from 'filepond';

// Create a multi file upload component
const pond = FilePond.create({
    multiple: true,
    name: 'filepond'
});

// Add it to the DOM
document.body.appendChild(pond.element);
```

Or get it from a CDN:

```html
<!DOCTYPE html>
<html>
<head>
  <title>FilePond from CDN</title>

  <!-- Filepond stylesheet -->
  <link href="https://unpkg.com/filepond/dist/filepond.css" rel="stylesheet">

</head>
<body>

  <!-- We'll transform this input into a pond -->
  <input type="file" class="filepond">

  <!-- Load FilePond library -->
  <script src="https://unpkg.com/filepond/dist/filepond.js"></script>

  <!-- Turn all file input elements into ponds -->
  <script>
  FilePond.parse(document.body);
  </script>

</body>
</html>
```

[Getting started with FilePond](https://pqina.nl/filepond/docs/patterns/getting-started/)


## Contributing

At the moment test coverage is not great, it's around 65%. To accept pull requests the tests need to be better, any help to improve them is very much appreciated.

Tests are based on Jest and can be run with `npm run test`

To build the library run `npm run build`


## Publications

* [Generating Image Thumbnails in the Browser using JavaScript and FilePond](https://dev.to/pqina/generating-image-thumbnails-in-the-browser-using-javascript-and-filepond-10b8)
* [How to upload files with Vue and FilePond](https://dev.to/pqina/how-to-upload-files-with-vue-and-filepond-1m02)
* [Smooth file uploading with React and FilePond](https://itnext.io/uploading-files-with-react-and-filepond-f8a798308557)
* [5 interesting technical challenges I faced while building FilePond](https://itnext.io/filepond-frontend-trickery-a3073c934c77)
* [Image uploads with Laravel and FilePond](https://devdojo.com/episode/image-uploads-with-laravel-and-filepond)
* [Integrating FilePond with Ember](https://alexdiliberto.com/ember-filepond/latest/)
* [FilePond launch day post-mortem](https://pqina.nl/blog/filepond-launch-day-post-mortem)
* [FilePond on ProductHunt](https://www.producthunt.com/posts/filepond-js)


### Browser Compatibility

FilePond is compatible with a wide range of desktop and mobile browsers, the oldest explicitly supported browser is IE11, for best cross browser support add [FilePond Polyfill](https://github.com/pqina/filepond-polyfill) and [Babel polyfill](https://babeljs.io/docs/en/babel-polyfill) to your project.

FilePond uses [BrowserStack](https://www.browserstack.com/) for compatibility testing.

[<img src="https://github.com/pqina/filepond-github-assets/blob/master/browserstack-logo.svg" height="32" alt="BrowserStack"/>](https://www.browserstack.com/)


## License

**Please don't remove or change the disclaimers in the source files**

MIT License

Copyright (c) 2020 PQINA | [Rik Schennink](mailto:rik@pqina.nl)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
