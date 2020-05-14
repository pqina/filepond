import "./windowMatchMedia.mock";
import { create } from '../index.js';

describe('create instance', () => {

    test('without parameters', () => {
        expect(create()).toBeDefined();
    });
    
    test('with options object only', () => {
        expect(create({
            instantUpload: false
        }).instantUpload).toBe(false);
    });
    
    test('with element only', () => {
        const form = document.createElement('form');
        const input = document.createElement('input');
        input.type = 'file';
        form.appendChild(input);
        expect(create(input).element.parentNode).toBe(form);
    });
    
    test('with element and options object', () => {
        const form = document.createElement('form');
        const input = document.createElement('input');
        input.type = 'file';
        input.dataset.dropOnPage = false;
        form.appendChild(input);
        const pond = create(input, {
            dropOnPage: true
        });
        expect(pond.dropOnPage).toBe(false);
    });

});