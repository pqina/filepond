export function isActivationKeyboardEvent(e: KeyboardEvent) {
    return [' ', 'Enter'].includes(e.key);
}

export function isCancelKeyboardEvent(e: KeyboardEvent) {
    return e.key === 'Escape';
}

export function isTabKeyboardEvent(e: KeyboardEvent) {
    return e.key === 'Tab';
}

export function isArrowKeyboardEvent(e: KeyboardEvent) {
    return e.key.startsWith('Arrow');
}

const Directions = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
};

export function getDirectionFromKeyboardEvent(e: KeyboardEvent): 'up' | 'down' | 'left' | 'right' {
    // @ts-ignore
    return Directions[e.key];
}
