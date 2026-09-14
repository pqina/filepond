import { h } from '../utils/dom.js';
import {
    createSourceExtension,
    type SourceExtensionOptions,
} from './common/createSourceExtension.js';

export interface URLInputSourceOptions extends SourceExtensionOptions {
    placeholder?: string;
}

export const URLInputSource = createSourceExtension({
    name: 'URLInputSource',
    props: {
        sourceIcon: 'link',
    } as URLInputSourceOptions,
    factory: ({ props }) => {
        function createSourceTemplate(inputAttributes: {
            [key: string]: string | number | boolean;
        }) {
            const { placeholder } = props;
            return [
                {
                    key: 'url-input',
                    tag: 'input',
                    attrs: {
                        ...inputAttributes,
                        type: 'url',
                        placeholder,
                    },
                },
            ];
        }

        return {
            createSourceTemplate,
        };
    },
});
