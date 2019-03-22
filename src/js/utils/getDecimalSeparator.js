import { getNonNumeric } from './getNonNumeric';

export const getDecimalSeparator = () =>
    getNonNumeric((1.1).toLocaleString())[0];
