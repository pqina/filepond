import { addGetSet } from './utils/addGetSet';

// add to external api and link to props

export const apis = ({ mixinConfig, viewProps, viewExternalAPI }) => {
    addGetSet(mixinConfig, viewExternalAPI, viewProps);
};
