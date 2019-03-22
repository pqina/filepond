import { createElement } from './createElement';

export const resetFileInput = input => {
    // no value, no need to reset
    if (!input || input.value === '') {
        return;
    }

    try {
        // for modern browsers
        input.value = '';
    } catch (err) {}

    // for IE10
    if (input.value) {
        // quickly append input to temp form and reset form
        const form = createElement('form');
        const parentNode = input.parentNode;
        const ref = input.nextSibling;
        form.appendChild(input);
        form.reset();

        // re-inject input where it originally was
        if (ref) {
            parentNode.insertBefore(input, ref);
        } else {
            parentNode.appendChild(input);
        }
    }
};
