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
const pond = FilePond.parse(document.body);
</script>
```

Read more in the [FilePond documentation](https://pqina.nl/filepond/docs/patterns/getting-started/)


## License terms

FilePond is licensed under [GPLv3](https://opensource.org/licenses/GPL-3.0).

### What does this mean?

* You **may** modify provided code in any way which doesn't conflict with above statement
* You **may** use this lib for any private projects which you do not plan to share or sell
* You **may** use this lib for public projects, BUT in such case you MUST share the full client source code of your project if asked. If you do not want to share your projects source code then you need to obtain a commercial license
* You **may not** remove the license and PQINA attribution from source files

GitHub automatically adds a quick overview header to the [repository LICENSE](https://github.com/pqina/filepond/blob/master/LICENSE) which might be helpful as well.

### Commercial use

Interested in using FilePond for a commercial project without the GPLv3 requirements, view the license options on the [pricing page](https://pqina.nl/filepond/pricing.html).
