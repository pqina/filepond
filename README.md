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
import { FilePond } from 'filepond';
```

Or get from a CDN

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

Read more in the [FilePond documentation](https://pqina.nl/filepond/docs/patterns/getting-started/)


## License terms

The free version of FilePond is licensed under [GPLv3](https://opensource.org/licenses/GPL-3.0).

### What does this mean?

* You **may** use this lib for private use without the requirements imposed by the license.
* You **may** use this lib for public projects as long as those projects are licensed under GPLv3 as well.
* You **may not** remove the license and PQINA attribution from source files.

For more information read the [repository license details](https://github.com/pqina/filepond/blob/master/LICENSE).

If the GPLv3 license does not match your use case, the [commercial license](https://pqina.nl/filepond/pricing.html#commercial-license) might be more suitable.

### Commercial use

Interested in using FilePond for a project without being restricted by the GPLv3 requirements, view the license options on the [pricing page](https://pqina.nl/filepond/pricing.html#commercial-license).
