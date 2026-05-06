export function didAbort(signal: AbortSignal | undefined, error: unknown): boolean {
    return !!signal && signal.aborted && error === signal.reason;
}
