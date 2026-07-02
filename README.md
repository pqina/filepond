# [<img src="https://github.com/pqina/filepond-github-assets/blob/master/logo.svg" height="44" alt="FilePond"/>](https://filepond.com)

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/pqina/filepond/blob/v/LICENSE)
[![npm version](https://badge.fury.io/js/filepond.svg)](https://www.npmjs.com/package/filepond)
![npm](https://img.shields.io/npm/dt/filepond)
[![Discord](https://img.shields.io/discord/1422126182924554291?label=discord)](https://discord.gg/KTyymsrTrX)

A JavaScript library that can upload anything you throw at it, optimizes images for faster uploads, and offers a great, accessible, silky smooth user experience.

**This is the v5 beta branch. [Take me to the v4 branch](https://github.com/pqina/filepond)**

TODO:

- [Finish docs](https://v5.filepond.com/)

If you're trying out v5, please share your feedback on [Discord](https://discord.gg/KTyymsrTrX)

## Install

We can install the `filepond` package by running the following command in our terminal:

```
npm install filepond@beta
```

We wrap an `<input type="file">` with the `<file-pond>` custom element and then register the custom element using the `defineFilePond` function. [Getting started](https://v5.filepond.com/docs/start-here/getting-started)

```html
<form action="/upload" method="POST">
    <label for="my-file">Files</label>
    <file-pond>
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

When integrating with a framework like React, Svelte, or Vue, we can use the `<file-pond>` custom element as if it were a Component. [Framework integration](https://v5.filepond.com/docs/start-here/framework-integration)

```tsx
import { useState } from 'react';

// FilePond imports
import { defineFilePond, type FilePondEntrySource, type FilePondElement } from 'filepond';
import { locale } from 'filepond/locales/en-gb.js';

// Optionally import React <file-pond> component types
import 'filepond/types/react';

// Define <file-pond> element and sets English locale
defineFilePond({
    locale,
});

export default function App() {
    // two-way data binding
    const [entries, setEntries] = useState<FilePondEntrySource[]>([
        new File(['hello'], 'world.txt', {
            type: 'text/plain',
        }),
    ]);

    // handle form submit
    function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();

        console.log('submit', e);
    }

    return (
        <form onSubmit={handleSubmit} method="POST">
            <label htmlFor="my-files">Documents</label>
            <file-pond
                onentrieschange={({ detail: currentEntries }) => {
                    setEntries(currentEntries);
                }}
                entries={entries}
            >
                <input id="my-files" name="my-files" type="file" required multiple />
            </file-pond>

            <button type="submit">Sumbit</button>
        </form>
    );
}
```

## License

[MIT](LICENSE.md)
