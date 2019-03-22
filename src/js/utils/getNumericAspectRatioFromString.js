import { isEmpty } from './isEmpty';

export const getNumericAspectRatioFromString = aspectRatio => {
    if (isEmpty(aspectRatio)) {
        return aspectRatio;
    }
    if(/:/.test(aspectRatio)) {
        const parts = aspectRatio.split(':');
        return parts[1] / parts[0];
    }
    return parseFloat(aspectRatio);
};