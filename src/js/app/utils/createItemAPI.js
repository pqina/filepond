import { copyObjectPropertiesToObject } from '../../utils/copyObjectPropertiesToObject';

const PRIVATE = [
    'fire',
    'process',
    'revert',
    'load',
    'on',
    'off',
    'onOnce',
    'retryLoad',
    'extend',
    'archive',
    'archived',
    'release',
    'released',
    'requestProcessing',
    'freeze'
];

export const createItemAPI = item => {
    const api = {};
    copyObjectPropertiesToObject(item, api, PRIVATE);
    return api;
};