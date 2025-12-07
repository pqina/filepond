import {
    nodeTree,
    type NodeTree,
    type NodeContext,
    type TemplateNode,
} from '../elements/common/nodeTree.js';
import type { FilePondEntry } from '../types/index.js';
import type {
    ExtensionState,
    ExtensionStatus,
    ExtensionStatusType,
} from '../extensions/common/createExtension.js';
import {
    isArray,
    isBlobOrFile,
    isDirectoryEntry,
    isFileEntry,
    isFunction,
    isRegExp,
    isString,
} from '../utils/test.js';
import { arrayWrap } from '../utils/array.js';
import { Button } from '../elements/components/Button/index.js';
import { ElementPane } from '../elements/components/ElementPane/index.js';
import { Entry } from '../elements/FilePondEntryList/components/Entry/index.js';

export function getEntryExtensionsAsArray(entry: FilePondEntry): ExtensionState[] {
    if (!entry || !entry.extension) {
        return [];
    }
    return Object.values(entry.extension);
}

export function getExtensionByAction(entry: FilePondEntry, action: string): ExtensionState | void {
    const extensions = getEntryExtensionsAsArray(entry);
    return extensions.find((extension) => extension.actions?.includes(action));
}

export function hasExtensionWithAction(entry: FilePondEntry, action: string) {
    return !!getExtensionByAction(entry, action);
}

export function hasExtensionWithStatusType(entry: FilePondEntry, types: ExtensionStatusType[]) {
    const extensions = getEntryExtensionsAsArray(entry);
    return !!extensions.find(
        (extension) => extension.status && types.includes(extension.status.type)
    );
}

export function hasExtensionWithStatusCode(entry: FilePondEntry, codes: string[]) {
    const extensions = getEntryExtensionsAsArray(entry);
    return !!extensions.find(
        (extension) => extension.status && codes.includes(extension.status.code)
    );
}

export function getExtensionStatusWithCode(
    entry: FilePondEntry,
    status: string
): ExtensionStatus | void {
    const extensions = getEntryExtensionsAsArray(entry);
    for (const extension of extensions) {
        if (extension.status && status.includes(extension.status.code)) {
            return extension.status;
        }
    }
}

export function createElementStack(options: { layout?: 'row' | 'stack' | 'pile'; class?: string }) {
    const { layout = 'row', class: klass } = options || {};
    return nodeTree({
        tag: 'element-stack',
        attrs: {
            class: klass,
            layout,
        },
    });
}

export function createSpringPane(options: { key: string; class: string }) {
    const { key, class: klass } = options || {};
    return {
        key,
        component: ElementPane,
        props: ({ visualRect }: NodeContext) => {
            return {
                class: klass,
                width: visualRect.width,
                height: visualRect.height,
            };
        },
    };
}

export function createButton(key: string, options: any): TemplateNode {
    let props;
    if (isFunction(options)) {
        props = (...args: any) => {
            const props = options(...args);
            return getAsButtonProps(props);
        };
    } else if (options.props) {
        if (isFunction(options.props)) {
            props = (...args: any) => {
                const props = options.props(...args);
                return getAsButtonProps(props);
            };
        } else {
            props = getAsButtonProps(options.props);
        }
    } else {
        props = getAsButtonProps(options);
    }

    return {
        key,
        component: Button,
        props,
    };
}

export function getAsButtonProps(props: { icon: string; label: string; title: string }) {
    const { icon, label, title } = props;
    return {
        ...props,
        label: isString(label) ? label : isString(title) ? title : isString(label) ? label : icon,
        title: isString(title) ? title : isString(label) ? label : icon,
        icon,
    };
}

function createNodeTreeWithTest(test: (context: NodeContext) => boolean): NodeTree {
    return nodeTree({
        if: {
            test,
            then: {
                // this will hold appended children
            },
        },
    });
}

function createEntryMatcher(matches: string | string[] | RegExp): (entry: Entry) => boolean {
    // regexp is easy test against file type
    if (isRegExp(matches)) {
        return (entry: Entry) =>
            isFileEntry(entry) && isBlobOrFile(entry.file) && matches.test(entry.file.type);
    }

    // matchers are more exotic
    const splitMatchers = isString(matches) ? matches.split(',') : isArray(matches) ? matches : [];
    const matchers: ((entry: Entry) => boolean)[] = splitMatchers.map((matcher: string) => {
        // is a dir
        if (/^(dir|directory|folder)$/.test(matcher)) {
            return (entry: Entry) => isDirectoryEntry(entry);
        }

        // is a file
        if (matcher === 'file') {
            return (entry: Entry) => isFileEntry(entry);
        }

        // test for a file extension
        if (matcher.startsWith('.')) {
            return (entry: Entry) => {
                return (
                    isFileEntry(entry) &&
                    isBlobOrFile(entry.file) &&
                    entry.file.name.endsWith(matcher)
                );
            };
        }

        // mimetype with wildcard or maintype without wildcard
        if (matcher.endsWith('*') || /^(audio|video|image|text)$/.test(matcher)) {
            const mainType = matcher.split('/')[0];
            return (entry: Entry) =>
                isFileEntry(entry) &&
                isBlobOrFile(entry.file) &&
                entry.file.type.startsWith(mainType);
        }

        // mimetype
        return (entry: Entry) => {
            return isFileEntry(entry) && isBlobOrFile(entry.file) && entry.file.type === matcher;
        };
    });

    // just return the first matchers if only one
    if (matchers.length === 1) {
        return matchers[0];
    }

    // return true if one of the matchers matches
    return (entry: Entry) => matchers.some((test) => test(entry));
}

export function whenEntryIs(matches: string | string[] | RegExp | ((entry: Entry) => boolean)) {
    const matchEntry = isFunction(matches) ? matches : createEntryMatcher(matches);
    return createNodeTreeWithTest(({ entry }: NodeContext) => matchEntry(entry));
}

export function whenEntryHasAction(actions: string | string[]) {
    const matches = arrayWrap(actions);
    return createNodeTreeWithTest(({ entry }: NodeContext) =>
        matches.some((action) => hasExtensionWithAction(entry, action))
    );
}

export function whenEntryNotHasStatus(...status: ExtensionStatusType[]) {
    return createNodeTreeWithTest(
        ({ entry }: NodeContext) => !hasExtensionWithStatusType(entry, status)
    );
}

export function whenEntryHasStatus(...status: ExtensionStatusType[]) {
    return createNodeTreeWithTest(({ entry }: NodeContext) =>
        hasExtensionWithStatusType(entry, status)
    );
}
