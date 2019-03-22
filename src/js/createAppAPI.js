import { copyObjectPropertiesToObject } from './utils/copyObjectPropertiesToObject';
const PRIVATE_METHODS = ['fire', '_read', '_write'];

export const createAppAPI = app => {
  const api = {};

  copyObjectPropertiesToObject(app, api, PRIVATE_METHODS);

  return api;
};
