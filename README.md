# <img src="https://github.com/pqina/filepond-github-assets/blob/master/logo.svg" height="44" alt="FilePond"/>

A JavaScript library that can upload anything you throw at it, optimizes images for faster uploads, and offers a great, accessible, silky smooth user experience.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/pqina/filepond/blob/master/LICENSE)
[![npm version](https://badge.fury.io/js/filepond.svg)](https://www.npmjs.com/package/filepond)
[![Backlog on WIP.chat](https://img.shields.io/badge/backlog-wip.chat-yellow.svg)](https://wip.chat/products/191/pending)
[![Donate with PayPal](https://img.shields.io/badge/donate-PayPal.me-pink.svg)](https://www.paypal.me/rikschennink/10)

21 KB gzipped. FilePond adapters are available for **[React](https://github.com/pqina/react-filepond)**, **[Vue](https://github.com/pqina/vue-filepond)**, **[Angular](https://github.com/pqina/ngx-filepond)** and **[jQuery](https://github.com/pqina/jquery-filepond)**

FilePond is maintained by **[Rik Schennink](https://twitter.com/rikschennink)**

<img src="https://github.com/pqina/filepond-github-assets/blob/master/filepond-animation-01.gif?raw=true" width="370" alt=""/>

### Core Features

*   Accepts **directories**, **files**, blobs, local URLs, **remote URLs** and Data URIs.
*   **Drop files**, select on filesystem, **copy and paste files**, or add files using the API.
*   **Async uploading** with AJAX, or encode files as base64 data and send along form post.
*   **Accessible**, tested with AT software like VoiceOver and JAWS, **navigable by Keyboard**.
*   **Image optimization**, automatic image resizing, **cropping**, and **fixes EXIF orientation**.
*   **Responsive**, automatically scales to available space, is functional on both **mobile and desktop devices**.

[Learn more about FilePond](https://pqina.nl/filepond)

### Plugins

*   [File encode](https://github.com/pqina/filepond-plugin-file-encode)
*   [File rename](https://github.com/pqina/filepond-plugin-file-rename)
*   [File size validation](https://github.com/pqina/filepond-plugin-file-validate-size)
*   [File type validation](https://github.com/pqina/filepond-plugin-file-validate-type)
*   [File metadata](https://github.com/pqina/filepond-plugin-file-metadata)
*   [File poster](https://github.com/pqina/filepond-plugin-file-poster)
*   [Image size validation](https://github.com/pqina/filepond-plugin-image-validate-size)
*   [Image preview](https://github.com/pqina/filepond-plugin-image-preview)
*   [Image crop](https://github.com/pqina/filepond-plugin-image-crop)
*   [Image resize](https://github.com/pqina/filepond-plugin-image-resize)
*   [Image transform](https://github.com/pqina/filepond-plugin-image-transform)
*   [Image EXIF orientation](https://github.com/pqina/filepond-plugin-image-exif-orientation)

### Adapters

*   [React](https://github.com/pqina/react-filepond)
*   [Vue](https://github.com/pqina/vue-filepond)
*   [jQuery](https://github.com/pqina/jquery-filepond)
*   [Angular](https://github.com/pqina/ngx-filepond)
*   [Angular 1](https://github.com/johnnyasantoss/angularjs-filepond)
*   [Ember](https://github.com/alexdiliberto/ember-filepond)

### Boilerplates

*   [PHP](https://github.com/pqina/filepond-boilerplate-php)

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

## License

**Please don't remove or change the disclaimers in the source files**

MIT License

Copyright (c) 2018 PQINA | [Rik Schennink](mailto:rik@pqina.nl)

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
