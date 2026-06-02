import type { FilePondEntry, RequestOptions } from '../../types/index.js';

export interface ResolvedRequest {
    /** URL to use */
    url: string;

    /** Options to pass to the request */
    options: RequestOptions;

    /** Metadata to store in the request object so it's accessible in the ResponseResolver. Not sent to server. */
    metadata?: { [key: string]: unknown };
}

export interface RequestResolverContext<Entry extends FilePondEntry = FilePondEntry>
    extends ResolvedRequest {
    entry: Entry;
}

export type RequestResolver<Entry extends FilePondEntry = FilePondEntry> = (
    request: RequestResolverContext<Entry>
) => ResolvedRequest | void | Promise<ResolvedRequest | void>;
