// @ts-nocheck
import type { DataTransferLoaderOptions } from './extensions/data-transfer-loader.ts';
import type { FileInputSourceOptions } from './extensions/file-input-source.ts';
import type { ValueCallbackStoreOptions } from './extensions/value-callback-store.ts';
import type { EntryListViewOptions } from './extensions/entry-list-view.ts';

declare module '../index.js' {
    interface FilePondElement {
        FileInputSource: FileInputSourceOptions;
        DataTransferLoader: DataTransferLoaderOptions;
        ValueCallbackStore: ValueCallbackStoreOptions;
        EntryListView: EntryListViewOptions;
    }
}

export {};
