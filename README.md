# <img src="https://github.com/pqina/filepond-github-assets/blob/master/logo.svg" height="44" alt="FilePond"/>

A (21 KB gzipped) JavaScript library that can **upload anything** you throw at it, **optimizes images** for faster uploads, and offers a great, **accessible**, silky **smooth user experience**.



<img src="https://github.com/pqina/filepond-github-assets/blob/master/filepond-animation-01.gif" width="370" height="400" alt=""/>

### Core Features

- Accepts **directories**, **files**, blobs, local URLs, **remote URLs** and Data URIs.
- **Drop files**, browse on filesystem, **copy and paste files**, or add files using the API.
- **Async uploading** with AJAX or encode files as base64 data and send along form post.
- **Accessible**, tested with AT software like VoiceOver and JAWS, **navigable by Keyboard**.
- **Image optimization**, automatic image resizing, **cropping**, and **correcting of EXIF orientation** on the client saves bandwidth.
- **Responsive**, automatically scales to available space, is function on both **mobile and desktop**.

### Plugins

- [File encode](https://github.com/pqina/filepond-plugin-file-encode)
- [File size validation](https://github.com/pqina/filepond-plugin-file-validate-size)
- [File type validation](https://github.com/pqina/filepond-plugin-file-validate-type)
- [Image preview](https://github.com/pqina/filepond-plugin-image-preview)
- [Image crop](https://github.com/pqina/filepond-plugin-image-crop)
- [Image resize](https://github.com/pqina/filepond-plugin-image-resize)
- [Image transform](https://github.com/pqina/filepond-plugin-image-transform)
- [Image EXIF orientation](https://github.com/pqina/filepond-plugin-image-exif-orientation)

### Boilerplates

- [PHP](https://github.com/pqina/filepond-boilerplate-php)

[Learn more about FilePond](https://pqina.nl/filepond)


## Quick Start

Install from NPM

[![npm version](https://badge.fury.io/js/filepond.svg)](https://badge.fury.io/js/filepond)

```bash
npm install filepond
```

Then import in your project:

```js
import * as FilePond from 'filepond';

// Create a multi file upload component
const pond = FilePond.create({
    multiple:true,
    name:'filepond'
});

// Add it to the DOM
document.body.appendChild(pond.element);
```

Or get it from a CDN

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

### Commercial license

If you want to use FilePond on commercial sites, themes, projects, and applications, the Commercial license is what you need. With the commercial license, your source code is kept proprietary. View the license options on the [pricing page](https://pqina.nl/filepond/pricing.html#commercial-license).

### Open source license

If you're working on an open source project under a license compatible with [GPLv3](https://opensource.org/licenses/GPL-3.0), you may use FilePond under the terms of the GPLv3.

For more information you can [read the full license here](https://pqina.nl/filepond/license).
