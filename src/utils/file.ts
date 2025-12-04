import { isString, isNumber, isBlob, isFile } from './test.js';
import { numberToFloat } from './number.js';

export const DEFAULT_BYTE_SIZES = {
    byte: 0,
    bytes: 0,
    KB: 1,
    MB: 2,
    GB: 3,
    TB: 4,
    PB: 5,
    EB: 6,
    ZB: 7,
    YB: 8,
};

const FILE_PROPS = ['name', 'size', 'type', 'lastModified'];

/** Copies file base properties to an object */
export function copyFilePropsToObject(file: File, object: any) {
    FILE_PROPS.forEach((key) => {
        // @ts-ignore
        object[key] = file[key];
    });
}

export function updateFileType(fileOrBlob: File | Blob, newType: string): File | Blob {
    return isBlob(fileOrBlob)
        ? new Blob([fileOrBlob], { type: newType })
        : new File([fileOrBlob], (fileOrBlob as File).name, {
              type: newType,
              lastModified: (fileOrBlob as File).lastModified,
          });
}

export function updateFilename(file: File, newName: string): File {
    return new File([file], newName, { type: file.type, lastModified: file.lastModified });
}

export function sanitizeFilename(filename: string) {
    return filename.trim().replace(/[<>:;,"/\\|?*\x00-\x1F]/gi, '');
}

/** Returns extension + preceding dot, `test.txt` returns `.txt` */
export function getExtensionFromFilename(filename: unknown): string | undefined {
    return isString(filename) ? /(?:\.([^.]+))?$/.exec(filename)?.[0] : undefined;
}

export function getFilenameWithoutExtension(filename: string): string | undefined {
    return isString(filename) ? filename.replace(/\.[^/.]+$/, '') : undefined;
}

const defaultTypeMap = { plain: 'txt' };

export function getExtensionFromMimeType(
    mimeType: string,
    typeMap: { [key: string]: string } = {}
): string | undefined {
    if (isString(mimeType) && mimeType.length) {
        const ext = (mimeType.match(/\/(?:x-)?([0-9a-z]+)(?:-compressed)?/i) || [])[1];
        if (ext) {
            return `.${{ ...defaultTypeMap, ...typeMap }[ext] || ext}`;
        }
    }
}

export function cloneBlob(blob: Blob): Blob {
    return new Blob([blob], { type: blob.type });
}

export function cloneFile(file: File): File {
    return new File([file], file.name, { type: file.type, lastModified: file.lastModified });
}

export function cloneBlobOrFile(blobOrFile: File | Blob): File | Blob | undefined {
    if (isBlob(blobOrFile)) {
        return cloneBlob(blobOrFile);
    }
    if (isFile(blobOrFile)) {
        return cloneFile(blobOrFile);
    }
}

export function cloneFileWithOptions(file: File, options: FilePropertyBag): File {
    return new File([file], file.name, {
        type: options.type ? options.type : file.type,
        lastModified: options.lastModified ? options.lastModified : file.lastModified,
    });
}

export function blobToFile(
    blob: Blob,
    name: string,
    options?: { type?: string | undefined; lastModified?: number }
): File {
    const { type = blob.type, lastModified = new Date().getTime() } = options ?? {};
    return new File([blob], name, {
        type,
        lastModified,
    });
}

export function blobReadAsArrayBuffer(blob: Blob, options?: { slice: number[] }) {
    const { slice } = options ?? {};
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onloadend = ({ target }) => resolve(target && target.result);
        fileReader.onerror = reject;
        fileReader.readAsArrayBuffer(slice ? blob.slice(...slice) : blob);
    });
}

export function naturalFileSizeToBytes(
    str: string | number,
    useBytes = false,
    locale: string | string[] | undefined = undefined,
    sizes: { [key: string]: number } = DEFAULT_BYTE_SIZES
) {
    // already is bytes
    if (isNumber(str)) {
        return str;
    }

    // parse natural file size
    const size = (str.match(/[\d.,]+/) || [])[0];

    // invalid size
    if (!size) {
        throw new Error(`naturalFileSizeToBytes: Invalid natural file size ${str}`);
    }

    // get size unit by removing found size from string
    const unit = str.replace(size, '').trim();

    // get as float based on locale
    const f = numberToFloat(size, locale);

    // now convert to bytes
    return f * Math.pow(useBytes ? 1024 : 1000, sizes[unit]);
}

/** Returns a string representing a natural file size, for example 24 KB */
export function bytesToNaturalFileSize(
    size: number,
    useBytes = false,
    options: Intl.NumberFormatOptions = {
        maximumFractionDigits: 0,
    },
    locale: string | string[] | undefined = undefined,
    sizes: string[] = Object.keys(DEFAULT_BYTE_SIZES)
) {
    const d = useBytes ? 1024 : 1000;
    const i = size === 0 ? 0 : Math.floor(Math.log(size) / Math.log(d));
    const v = new Intl.NumberFormat(locale, { style: 'decimal', ...options }).format(
        size / Math.pow(d, i)
    );
    return `${v} ${sizes[size === 1 ? 0 : i + 1]}`;
}

const runTest = (bytes: Uint8Array, expected: number[]) =>
    expected.every((expectedByte, index) => bytes[index] === expectedByte);

const createTest =
    (type: string, expected: number[]): ((bytes: Uint8Array) => string | false) =>
    (bytes) =>
        runTest(bytes, expected) && type;

const TYPE_APP = 'application/';
const TYPE_IMG = 'image/';

const COMMON_TYPE_TESTS = [
    [TYPE_IMG + 'jpeg', [0xff, 0xd8, 0xff]],
    [TYPE_IMG + 'png', [0x89, 0x50, 0x4e, 0x47]],
    [TYPE_IMG + 'gif', [0x47, 0x49, 0x46]],
    [TYPE_IMG + 'tiff', [0x49, 0x49, 0x2a, 0x00]],
    [TYPE_IMG + 'psd', [0x38, 0x42, 0x50, 0x53]],
    [TYPE_IMG + 'bmp', [0x42, 0x4d]],
    [TYPE_APP + 'pdf', [0x25, 0x50, 0x44, 0x46]],
    [TYPE_APP + 'zip', [0x50, 0x4b, 0x04, 0x04]],
    [TYPE_APP + 'ogg', [0x4f, 0x67, 0x67, 0x53]],
    [TYPE_APP + 'x-rar-compressed', [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07]],
].map((args) => createTest(...(args as [string, number[]])));

export function getCommonMimeTypeFromFileHeader(
    bytes: Uint8Array,
    additionalTypeTests: ((bytes: Uint8Array) => string | false | undefined)[] = []
): string | undefined {
    const typeTests = [...additionalTypeTests, ...COMMON_TYPE_TESTS];
    for (const typeTest of typeTests) {
        const type = typeTest(bytes);
        if (type) {
            return type;
        }
    }
}

/** A quick way to get a hash from a file, the hash is calculated from the center of the file */
export async function getApproximateBlobHash(
    blobOrFile: Blob | File,
    hashSize = 64
): Promise<string> {
    if (hashSize <= 0) {
        throw new Error('getApproximateBlobHash: hashSize needs to be a positive non zero integer');
    }
    const center = Math.round(blobOrFile.size * 0.5);
    const range = Math.min(hashSize, blobOrFile.size);
    const sectionLeft = Math.floor(range / 2);
    const sectionRight = Math.ceil(range / 2);
    const blobSlice = blobOrFile.slice(center - sectionLeft, center + sectionRight);
    return new Uint8Array(await blobSlice.arrayBuffer()).join('');
}

/** Supply accuracy, total bytes in middle of file to compare, with third argument */
export async function filesAreProbablyEqual(
    a: Blob | File | undefined,
    b: Blob | File | undefined,
    hashSize?: number
): Promise<boolean> {
    // always a new file if no current file
    if (!a || !b) {
        return false;
    }

    // compare hashes
    const hashA = await getApproximateBlobHash(a, hashSize);
    const hashB = await getApproximateBlobHash(b, hashSize);

    return hashA === hashB;
}
