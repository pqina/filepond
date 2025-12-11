import packageJson from './package.json' with { type: 'json' };

export const banner = `/*!
* FilePond v${packageJson.version}
* Copyright (c) 2017-${new Date().getFullYear()} Pqina B.V.
* Released under the MIT License
* https://filepond.com
*/`;
