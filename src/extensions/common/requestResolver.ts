import type { FilePondEntry, PublicRequestOptions } from '../../types/index.js';

export interface ResolvedRequest {
    url: string;
    options: PublicRequestOptions;
}

export interface RequestResolverContext<Entry extends FilePondEntry = FilePondEntry>
    extends ResolvedRequest {
    entry: Entry;
}

export type RequestResolver<Entry extends FilePondEntry = FilePondEntry> = (
    request: RequestResolverContext<Entry>
) => ResolvedRequest | void | Promise<ResolvedRequest | void>;
