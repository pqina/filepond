import type { Size } from './size.js';
import { sizeCreate } from './size.js';
import { isImageFile, isVideoFile } from './test.js';

/**
 * Returns size in width/height of media file or `null` if is not a media file the browser can
 * handle
 */
export function getMediaSize(file: File): Promise<Size | null> {
    if (isImageFile(file)) {
        return getImageSize(file);
    }

    if (isVideoFile(file)) {
        return getVideoSize(file);
    }

    return Promise.resolve(null);
}

/** Returns size in width/height of an image file */
export async function getImageSize(
    file: Blob,
    options?: { bytesToRead?: number }
): Promise<Size | null> {
    const { bytesToRead = 65536 } = options ?? {};
    const buffer = await file.slice(0, bytesToRead).arrayBuffer();
    const view = new DataView(buffer);

    // try to read size from bytes
    let size;
    if (isJPEG(view)) {
        size = getSizeFromJPEG(view);
    } else if (isPNG(view)) {
        size = getSizeFromPNG(view);
    } else if (isWEBP(view)) {
        size = getSizeFromWEBP(view);
    } else if (isGIF(view)) {
        size = getSizeFromGIF(view);
    } else if (isHEIC(view) || isAVIF(view)) {
        size = getSizeFromBMFF(view);
    }

    // fallback to decoding the image and getting the natural width and height
    return size || getImageSizeWithElement(file);
}

/** Tests if data view is of type JPEG */
function isJPEG(view: DataView) {
    // Test for JPEG SOI marker
    return view.getUint16(0) === 0xffd8;
}

/** Returns the size of the JPEG view */
function getSizeFromJPEG(view: DataView) {
    const { byteLength } = view;
    let offset = 2;
    while (offset < byteLength - 7) {
        const marker = view.getUint16(offset);
        const length = view.getUint16(offset + 2);
        // Search for relevant JPEG SOF marker (we mask the second part of the marker to check if it starts with 0xff, could also have used getUint8() to only get the first byte)
        if ((marker & 0xff00) === 0xff00 && marker >= 0xffc0 && marker <= 0xffcf) {
            return sizeCreate(view.getUint16(offset + 7), view.getUint16(offset + 5));
        }
        offset += length + 2;
    }
    return null;
}

/** Tests if data view is of type PNG */
function isPNG(view: DataView) {
    return view.getUint32(0) === 0x89504e47;
}

function getSizeFromPNG(view: DataView) {
    return sizeCreate(view.getUint32(16), view.getUint32(20));
}

/** Tests if data view is of type WEBP */
function isWEBP(view: DataView) {
    // check RIFF header and WEBP signature
    return view.getUint32(0) === 0x52494646 || view.getUint32(8) === 0x57454250;
}

function getSizeFromWEBP(view: DataView) {
    const { byteLength } = view;

    const WEBP = 0x57454250; // "WEBP"
    const RIFF = 0x52494646; // "RIFF"
    const VP8X = 0x56503858; // "VP8X"
    const VP8_ = 0x56503820; // "VP8 "
    const VP8L = 0x5650384c; // "VP8L"

    const getUInt24LittleEndian = (view: DataView, offset: number) =>
        view.getUint8(offset) |
        (view.getUint8(offset + 1) << 8) |
        (view.getUint8(offset + 2) << 16);

    if (byteLength < 16 || view.getUint32(0, false) !== RIFF || view.getUint32(8, false) !== WEBP)
        return null;

    let offset = 12;

    while (offset + 8 <= byteLength) {
        const type = view.getUint32(offset, false);
        const size = view.getUint32(offset + 4, true);
        const data = offset + 8;
        if (data + size > byteLength) break;

        if (type === VP8X) {
            return sizeCreate(
                1 + getUInt24LittleEndian(view, data + 4),
                1 + getUInt24LittleEndian(view, data + 7)
            );
        }

        if (type === VP8_) {
            if (
                size >= 10 &&
                view.getUint8(data + 3) === 0x9d &&
                view.getUint8(data + 4) === 0x01 &&
                view.getUint8(data + 5) === 0x2a
            ) {
                return sizeCreate(
                    // only interested in the first 14 bits (& 0x3fff)
                    view.getUint16(data + 6, true) & 0x3fff,
                    view.getUint16(data + 8, true) & 0x3fff
                );
            }
        }

        if (type === VP8L) {
            if (size >= 5 && view.getUint8(data) === 0x2f) {
                const bits = view.getUint32(data + 1, true);
                return sizeCreate((bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1);
            }
        }

        // if size is odd, add 1 byte of padding
        offset = data + size + (size % 2);
    }

    return null;
}

/** Tests if data view is of type GIF */
function isGIF(view: DataView) {
    return view.getUint32(0) === 0x47494638;
}

function getSizeFromGIF(view: DataView) {
    // GIF dimensions are always little-endian
    return sizeCreate(view.getUint16(6, true), view.getUint16(8, true));
}

/** HEIC types to check agains */
const HEICBrands = [
    0x68656963, // 'heic'
    0x68656978, // 'heix'
    0x6865696d, // 'heim'
    0x68656973, // 'heis'
    0x6d696631, // 'mif1'
    0x6d696631, // 'msf1'
];

/** Tests if data view is of type HEIC */
function isHEIC(view: DataView) {
    // ftyp box
    const ftyp = view.getUint32(4);
    if (ftyp !== 0x66747970) {
        return false;
    }

    // test for formats associated with heic extension
    const brand = view.getUint32(8);
    return HEICBrands.includes(brand);
}

/** Tests if data view is of type AVIF */
function isAVIF(view: DataView) {
    // ftyp box
    const ftyp = view.getUint32(4);
    if (ftyp !== 0x66747970) {
        return false;
    }

    // get brand
    const brand = view.getUint32(8, false);
    // 'avif' or 'avis'
    return brand === 0x61766966 || brand === 0x61766973;
}

/** Returns the size of the BMFF view (for HEIC and AVIF) */
function getSizeFromBMFF(view: DataView) {
    const { byteLength } = view;
    let offset = 0;
    while (offset < byteLength - 16) {
        const size = view.getUint32(offset);
        const type = view.getUint32(offset + 4);

        // we're looking for the meta box
        if (type === 0x6d657461) {
            offset += 12;
            continue;
        }

        // we're looking for the iprp box, or ipco box, in both situations we advance the offset
        if (type === 0x69707270 || type === 0x6970636f) {
            offset += 8;
            continue;
        }

        // Search for 'ispe', the Image Spatial Extent box
        if (type === 0x69737065) {
            return sizeCreate(view.getUint32(offset + 12), view.getUint32(offset + 16));
        }

        // we make sure size is correct to prevent infinite loops on bad data
        offset += size > 8 ? size : 8;
    }

    return null;
}

export function getImageSizeWithElement(file: Blob): Promise<Size> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onerror = (err) => {
            URL.revokeObjectURL(image.src);
            reject(new Error('Unknown'));
        };
        image.onload = () => {
            const { naturalWidth: width, naturalHeight: height } = image;
            URL.revokeObjectURL(image.src);
            resolve({
                width,
                height,
            });
        };
        image.src = URL.createObjectURL(file);
    });
}

/** Returns size in width/height of a video file */
export async function getVideoSize(
    file: Blob,
    options?: { bytesToRead?: number }
): Promise<Size | null> {
    const { bytesToRead = 65536 } = options ?? {};
    const buffer = await file.slice(0, bytesToRead).arrayBuffer();
    const view = new DataView(buffer);

    // try to read size from bytes
    let size;
    if (isMP4(view)) {
        size = getSizeFromMP4(view);
    }

    // use video element
    return size || getVideoSizeWithElement(file);
}

/** Tests if data view is of type MP4 */
function isMP4(view: DataView) {
    return view.getUint32(4) === 0x66747970;
}

/** Returns the size of the JPEG view */
function getSizeFromMP4(view: DataView) {
    const { byteLength } = view;
    let offset = 0;
    while (offset < byteLength) {
        const size = view.getUint32(offset);
        const type = view.getUint32(offset + 4);

        // dive in moov box
        if (type === 0x6d6f6f76) {
            offset += 8;
            continue;
        }

        // dive in trak box
        if (type === 0x7472616b) {
            offset += 8;
            continue;
        }

        // dive in dkhd box
        if (type === 0x746b6864) {
            // Create size object
            return sizeCreate(
                view.getUint32(offset + size - 8) >> 16,
                view.getUint32(offset + size - 4) >> 16
            );
        }

        // we make sure size is correct to prevent infinite loops on bad data
        offset += size > 8 ? size : 8;
    }
    return null;
}

/** Returns size in width/height of video file */
export function getVideoSizeWithElement(file: Blob): Promise<Size> {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onerror = reject;
        video.onloadedmetadata = () => {
            const { videoWidth: width, videoHeight: height } = video;
            URL.revokeObjectURL(video.src);
            resolve({
                width,
                height,
            });
        };
        video.src = URL.createObjectURL(file);
    });
}
