# [<img src="https://github.com/pqina/filepond-github-assets/blob/master/logo.svg" height="44" alt="FilePond"/>](https://filepond.com)

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/pqina/filepond/blob/v/LICENSE)
[![npm version](https://badge.fury.io/js/filepond.svg)](https://www.npmjs.com/package/filepond)
![npm](https://img.shields.io/npm/dt/filepond)
[![Discord](https://img.shields.io/discord/1422126182924554291?label=discord)](https://discord.gg/KTyymsrTrX)

A JavaScript library that can upload anything you throw at it, optimizes images for faster uploads, and offers a great, accessible, silky smooth user experience.

**This is the v5 alpha/beta branch. [Take me to the v4 branch](https://github.com/pqina/filepond)**

TODO:

-   Docs are on the way
-   Naming of some types
-   Safari flashing of video while dragging
-   Run more tests on mobile devices
-   Add basic image manipulation extensions
-   default styles for `:valid`, `:invalid`, and `:focus`

If you're trying out v5, please share your feedback on [Discord](https://discord.gg/KTyymsrTrX)

## Install

We can install the `filepond` package by running the following command in our terminal:

```
npm install filepond@alpha
```

We wrap an `<input type="file">` with the `<file-pond>` custom element and then register the custom element using the `defineFilePond` function.

```html
<form action="/upload" method="POST">
    <file-pond>
        <label for="my-file">Drop files here, or <u>browse</u></label>
        <input id="my-file" type="file" name="files" required />
    </file-pond>

    <button type="submit">Upload</button>
</form>

<script type="module">
    import { defineFilePond } from 'filepond';
    import { en_GB } from 'filepond/locales';

    const elements = defineFilePond({
        locale: en_GB,
    });
</script>
```

## License

Copyright (c) 2017-2025 Pqina

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

```

```
