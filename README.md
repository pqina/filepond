# [<img src="https://github.com/pqina/filepond-github-assets/blob/master/logo.svg" height="44" alt="FilePond"/>](https://filepond.com)

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/pqina/filepond/blob/v/LICENSE)
[![npm version](https://badge.fury.io/js/filepond.svg)](https://www.npmjs.com/package/filepond)
![npm](https://img.shields.io/npm/dt/filepond)
[![Discord](https://img.shields.io/discord/1422126182924554291?label=discord)](https://discord.gg/KTyymsrTrX)

A JavaScript library that can upload anything you throw at it, optimizes images for faster uploads, and offers a great, accessible, silky smooth user experience.

**This is the v5 beta branch. [Take me to the v4 branch](https://github.com/pqina/filepond)**

TODO:

-   [Finish docs](https://v5.filepond.com/)
-   Better naming of various types
-   Add basic image manipulation extensions

If you're trying out v5, please share your feedback on [Discord](https://discord.gg/KTyymsrTrX)

## Install

We can install the `filepond` package by running the following command in our terminal:

```
npm install filepond@beta
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
    import { locale } from 'filepond/locales/en-gb.js';

    const elements = defineFilePond({
        locale,
    });
</script>
```

When using a framework like React, Svelte, or Vue we can use the `<file-pond>` custom element as if it were a Component.

```jsx
import { useState } from 'react';

import { defineFilePond } from 'filepond';
import { locale } from 'filepond/locales/en-gb.js';

defineFilePond({
    locale,
});

export default function App() {
    const [myEntries, setMyEntries] = useState([]);
    return (
        <file-pond entries={myEntries}>
            <label htmlFor="my-file">
                Drop files here, or <u>browse</u>
            </label>
            <input id="my-file" type="file" name="docs" />
        </file-pond>
    );
}
```

## License

[MIT](LICENSE.md)
