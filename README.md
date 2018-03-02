# <img src="https://github.com/pqina/filepond-github-assets/blob/master/logo.svg" height="44" alt="FilePond"/>

**A JavaScript file upload plugin that's easy to setup and a joy to use.**

Beautiful animations, fast uploads with client-side image optimization, and a great, accessible, user experience.

[Learn more about FilePond](https://pqina.nl/filepond)


<img src="https://github.com/pqina/filepond-github-assets/blob/master/filepond-animation-01.gif" width="370" height="400" alt=""/>


## Quick Start

Install from NPM [![npm version](https://badge.fury.io/js/filepond.svg)](https://badge.fury.io/js/filepond)
```bash
npm install filepond
```

Then import in your project:

```js
import * as FilePond from 'filepond';
```

Or get it from a CDN

```html
<!-- add to document <head> -->
<link href="https://unpkg.com/filepond/dist/filepond.css" rel="stylesheet">

<!-- add before </body> -->
<script src="https://unpkg.com/filepond/dist/filepond.js"></script>
```

Now you can turn an `<input type="file">` into a FilePond.

```html
<input type="file" class="filepond'>

<script>
FilePond.parse(document.body);
</script>
```

[Getting started with FilePond](https://pqina.nl/filepond/docs/patterns/getting-started/)


## License

### Commercial license

If you want to use FilePond on commercial sites, themes, projects, and applications, the Commercial license is what you need. With the commercial license, your source code is kept proprietary. View the license options on the [pricing page](https://pqina.nl/filepond/pricing.html#commercial-license).

### Open source license

If you're working on an open source project under a license compatible with [GPLv3](https://opensource.org/licenses/GPL-3.0), you may use FilePond under the terms of the GPLv3.

For more information you can [read the full license here](https://pqina.nl/filepond/license).
