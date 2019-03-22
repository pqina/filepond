import { leftPad } from './leftPad';
export const getDateString = (date = new Date()) =>
    `${date.getFullYear()}-${leftPad(date.getMonth() + 1, '00')}-${leftPad(
        date.getDate(),
        '00'
    )}_${leftPad(date.getHours(), '00')}-${leftPad(
        date.getMinutes(),
        '00'
    )}-${leftPad(date.getSeconds(), '00')}`;
