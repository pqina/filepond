import { h } from '../utils/dom.js';
import { createSourceExtension } from './common/createSourceExtension.js';

export const URLInputSource = createSourceExtension({
    name: 'URLInputSource',
    props: {
        sourceIcon: 'link',
    },
    factory: () => {
        function createSourceElement() {
            return h('input', { type: 'url' });
        }

        return {
            createSourceElement,
        };
    },
});
