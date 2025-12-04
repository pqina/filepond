import { h } from '../utils/dom.js';
import { blobToFile } from '../utils/file.js';
import { createRandomish, randomNumberBetween } from '../utils/math.js';

const RANDOMISH_SEED = 1;

const generateRandomishNumber = createRandomish(RANDOMISH_SEED);

// types
export interface GenerateFileOptions {
    name?: string;
    type?: string;
    content?: string;
    lastModified?: number;
}

export interface GenerateImageOptions extends GenerateFileOptions {
    width?: number;
    height?: number;
    quality?: number;
    fillStyle?: string | CanvasGradient | CanvasPattern;
}

export interface TimeInfo {
    ms: number;
    step: number;
}

// logic
function isPlainDocument(name: string, type?: string): boolean {
    if (type) {
        return /text/.test(type);
    }
    return /\.(txt|md|markdown)$/.test(name);
}

function isCanvasSupportedImage(name: string, type?: string): boolean {
    if (type) {
        return /image/.test(type);
    }
    return /\.(png|jpg|jpeg|webp)$/.test(name);
}

/**
 * Generates a mock file for testing and development purposes.
 *
 * Creates either a document or image file based on the name and type. Useful for testing FilePond
 * functionality without needing real files.
 */
export async function generateFile(options?: GenerateFileOptions): Promise<File | null> {
    const { name = 'Untitled', type } = options ?? {};

    if (isPlainDocument(name, type)) {
        return (
            (await generateDocument({
                ...options,
                name,
            })) ?? null
        );
    }

    if (isCanvasSupportedImage(name, type)) {
        return await generateImage({
            ...options,
            name,
        });
    }

    return null;
}

/**
 * Generates a mock image file with a colorful gradient and type information overlay.
 *
 * Creates a canvas-based image with random gradient colors and text showing the file type and
 * dimensions. Useful for testing image handling functionality.
 */
export async function generateImage(options?: GenerateImageOptions): Promise<File> {
    const {
        name = 'Untitled',
        width = 1280,
        height = 720,
        quality = 0.98,
        fillStyle = undefined,
        lastModified = Date.now(),
    } = options ?? {};

    let type = 'image/png';
    if (name && !options?.type) {
        const ext = name.split('.').pop();
        if (ext && /jpeg|png|webp/.test(ext)) {
            type = `image/${name.split('.').pop()}`;
        }
    }

    const canvas = h('canvas', {
        width,
        height,
    }) as HTMLCanvasElement;

    const ctx = canvas.getContext('2d')!;

    const gradient = ctx.createLinearGradient(
        width * generateRandomishNumber(),
        0,
        width * generateRandomishNumber(),
        height
    );

    const stops = 3;
    const HueStepMin = 30;
    let hue = Math.round(randomNumberBetween(0, 360 - HueStepMin, generateRandomishNumber));
    for (let i = 0; i < stops; i++) {
        hue += Math.round(randomNumberBetween(HueStepMin, 90, generateRandomishNumber));
        gradient.addColorStop(i / (stops - 1), `hsl(${hue} 90% 50%)`);
    }

    ctx.fillStyle = fillStyle || gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${width / 16}px sans-serif`;
    ctx.fillText(`${type} ${width} × ${height}`, width * 0.5, height * 0.5);

    const blob = await new Promise<Blob>((resolve, reject) => {
        try {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to create blob from canvas'));
                    }
                },
                type,
                quality
            );
        } catch (err) {
            reject(err);
        }
    });

    const filename = /\./.test(name) ? name : `${name}.${type.split('/').pop()}`;
    return blobToFile(blob, filename, { type, lastModified });
}

/**
 * Generates a mock text document for testing purposes.
 *
 * Creates a simple text file with customizable content. Useful for testing document handling and
 * processing functionality.
 */
export async function generateDocument(options?: GenerateFileOptions): Promise<File | undefined> {
    const {
        name = 'Untitled',
        type = 'text/plain',
        content = 'Hello World',
        lastModified = Date.now(),
    } = options ?? {};

    // generate a txt file
    if (type === 'text/plain') {
        return new File([content], `${name}.txt`, {
            type,
            lastModified,
        });
    }
}

let startDate: number | undefined;
let prevDate: number | undefined;

/**
 * Returns timing information for performance measurement and debugging.
 *
 * Tracks elapsed time since first call and step time between calls. Useful for measuring
 * performance of operations during development.
 */
export function now(): TimeInfo {
    const currentTime = performance.now();
    if (!startDate) startDate = currentTime;
    if (!prevDate) prevDate = currentTime;
    const step = currentTime - prevDate;
    prevDate = currentTime;
    return { ms: currentTime - startDate, step };
}
