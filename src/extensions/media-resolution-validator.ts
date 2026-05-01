import type { FilePondEntry } from '../types/index.js';
import {
    createValidatorExtension,
    type ValidationResultInvalid,
    type ValidatorExtensionOptions,
} from './common/createValidatorExtension.js';
import { isFile, isFileEntry, isImageFile, isVideoFile } from '../utils/test.js';
import { getMediaSize } from '../utils/media.js';

export interface MediaResolutionValidatorOptions extends ValidatorExtensionOptions {
    /** Min media width. Defaults to `1` */
    minWidth?: number;

    /** Max media width. Defaults to `Infinity` */
    maxWidth?: number;

    /** Min media height. Defaults to `1` */
    minHeight?: number;

    /** Max media height. Defaults to `Infinity` */
    maxHeight?: number;

    /** Min media resolution. Defaults to `1` */
    minResolution?: number;

    /** Max media resolution. Defaults to `Infinity` */
    maxResolution?: number;

    /**
     * Function used to convert pixels (resolution) to natural resolution. Defaults to `(pixels) => Math.round(pixels / 1000000)`
     */
    toNaturalResolution?: (pixels: number) => string;
}

export const MediaResolutionValidator = createValidatorExtension({
    name: 'MediaResolutionValidator',
    props: {
        toNaturalResolution: (pixels) => {
            return `${Math.round(pixels / 1000000)}`;
        },
    } as MediaResolutionValidatorOptions,
    factory: ({ props, didSetProps }, { updateEntry }) => {
        let hasWidthLimitation = false;
        let hasHeightLimitation = false;
        let hasResolutionLimitation = false;

        didSetProps(
            ({
                minWidth = 1,
                maxWidth = Infinity,
                minHeight = 1,
                maxHeight = Infinity,
                minResolution = 1,
                maxResolution = Infinity,
            }: MediaResolutionValidatorOptions) => {
                hasWidthLimitation = minWidth > 0 || maxWidth < Infinity;
                hasHeightLimitation = minHeight > 0 || maxHeight < Infinity;
                hasResolutionLimitation = minResolution > 0 || maxResolution < Infinity;
            }
        );

        async function validateEntry(
            entry: FilePondEntry
        ): Promise<null | ValidationResultInvalid> {
            // all good!
            if (!isFileEntry(entry) || !isFile(entry.file)) {
                return null;
            }

            // get metadata
            const { file } = entry;

            // no need to validate
            if (!hasWidthLimitation && !hasHeightLimitation && !hasResolutionLimitation) {
                return null;
            }

            // get media size so we can check it against the requirements
            const mediaSize = await getMediaSize(file);

            // media size is null when we can't read the file
            if (mediaSize === null) {
                return {
                    code: 'VALIDATION_MEDIA_SIZE_UNAVAILABLE',
                };
            }

            // update entry metadata
            updateEntry(entry, {
                meta: {
                    size: mediaSize,
                },
            });

            const { width, height } = mediaSize;
            const {
                minWidth,
                maxWidth,
                minHeight,
                maxHeight,
                minResolution,
                maxResolution,
                toNaturalResolution,
            } = props;

            if (hasWidthLimitation && (width < minWidth || width > maxWidth)) {
                const tooSmall = width < minWidth;
                const tooLarge = width > maxWidth;
                const outsideRange = minWidth > 1 && maxWidth < Infinity;

                if (outsideRange) {
                    return {
                        code: 'VALIDATION_MEDIA_WIDTH_RANGE_MISMATCH',
                        values: {
                            minWidth,
                            minWidthUnit: 'unitPixels',
                            maxWidth,
                            maxWidthUnit: 'unitPixels',
                        },
                    };
                }

                if (tooSmall) {
                    return {
                        code: 'VALIDATION_MEDIA_WIDTH_UNDERFLOW',
                        values: { minWidth, minWidthUnit: 'unitPixels' },
                    };
                }

                if (tooLarge) {
                    return {
                        code: 'VALIDATION_MEDIA_WIDTH_OVERFLOW',
                        values: { maxWidth, maxWidthUnit: 'unitPixels' },
                    };
                }
            }

            if (hasHeightLimitation && (height < minHeight || height > maxHeight)) {
                const tooSmall = height < minHeight;
                const tooLarge = height > maxHeight;
                const outsideRange = minHeight > 1 && maxHeight < Infinity;

                if (outsideRange) {
                    return {
                        code: 'VALIDATION_MEDIA_HEIGHT_RANGE_MISMATCH',
                        values: {
                            minHeight,
                            minHeightUnit: 'unitPixels',
                            maxHeight,
                            maxHeightUnit: 'unitPixels',
                        },
                    };
                }

                if (tooSmall) {
                    return {
                        code: 'VALIDATION_MEDIA_HEIGHT_UNDERFLOW',
                        values: { minHeight, minHeightUnit: 'unitPixels' },
                    };
                }

                if (tooLarge) {
                    return {
                        code: 'VALIDATION_MEDIA_HEIGHT_OVERFLOW',
                        values: { maxHeight, maxHeightUnit: 'unitPixels' },
                    };
                }
            }

            const resolution = width * height;
            if (
                hasResolutionLimitation &&
                (resolution < minResolution || resolution > maxResolution)
            ) {
                const tooSmall = resolution < minResolution;
                const tooLarge = resolution > maxResolution;
                const outsideRange = minResolution > 1 && maxResolution < Infinity;

                if (outsideRange) {
                    return {
                        code: 'VALIDATION_MEDIA_RESOLUTION_RANGE_MISMATCH',
                        values: {
                            minResolution: toNaturalResolution(minResolution),
                            maxResolution: toNaturalResolution(maxResolution),
                        },
                    };
                }

                if (tooSmall) {
                    return {
                        code: 'VALIDATION_MEDIA_RESOLUTION_UNDERFLOW',
                        values: { minResolution: toNaturalResolution(minResolution) },
                    };
                }

                if (tooLarge) {
                    return {
                        code: 'VALIDATION_MEDIA_RESOLUTION_OVERFLOW',
                        values: { maxResolution: toNaturalResolution(maxResolution) },
                    };
                }
            }

            // all good!
            return null;
        }

        function canValidateEntry(entry: FilePondEntry): boolean {
            return isFileEntry(entry) && (isImageFile(entry.file) || isVideoFile(entry.file));
        }

        return {
            validateEntry,
            canValidateEntry,
        };
    },
});

declare module '../index.js' {
    interface FilePondElement {
        MediaResolutionValidator: MediaResolutionValidatorOptions;
    }
    interface defineFilePondOptions {
        MediaResolutionValidator: MediaResolutionValidatorOptions;
    }
}
