import type {
    FilePondElement,
    FilePondElementEventMap as ElementEventMap,
    FilePondInputElementEventMap as InputElementEventMap,
} from 'filepond';
/**
 * Checks whether two types are exactly equal. Used by WritableKeys to detect if removing `readonly` changed a property.
 */
type IfEquals<X, Y, A = X, B = never> =
    (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B;

/**
 * Gets keys for setters. This filters out readonly/getter-only properties such as `validity` and `form`.
 */
type WritableKeys<T> = {
    [K in keyof T]-?: IfEquals<{ [Q in K]: T[K] }, { -readonly [Q in K]: T[K] }, K>;
}[keyof T];

/** Gets keys for data-like properties and excludes methods such as browse() and insertEntries(). */
export type NonFunctionKeys<T> = {
    [K in keyof T]: T[K] extends (...args: never[]) => unknown ? never : K;
}[keyof T];

/** Picks only data-like properties from a type. */
export type NonFunctionProps<T> = Pick<T, NonFunctionKeys<T>>;

/** Retain own keys */
type ElementOwnKeys = Omit<FilePondElement, keyof HTMLElement>;

/** Only Writable keys */
type ElementWritableKeys = WritableKeys<ElementOwnKeys>;

/** Only Non Function keys */
type ElementNonFunctionKeys = NonFunctionKeys<ElementOwnKeys>;

/** Props exposed by the <file-pond> custom element */
export type FilePondElementProps = Partial<
    Pick<ElementOwnKeys, Extract<ElementWritableKeys, ElementNonFunctionKeys>>
>;

/** Events emitted by the <file-pond> custom element */
export type FilePondElementEventMap = ElementEventMap & InputElementEventMap;
