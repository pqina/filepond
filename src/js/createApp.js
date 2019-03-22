import { isNode } from './utils/isNode';
import { createAppObject } from './createAppObject';
import { createAppAtElement } from './createAppAtElement';

// if an element is passed, we create the instance at that element, if not, we just create an up object
export const createApp = (...args) =>
  isNode(args[0]) ? createAppAtElement(...args) : createAppObject(...args);
