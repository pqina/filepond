import { createView, createRoute } from '../frame/index';
import { blob } from './blob';

const addBlob = ({ root }) => {
    const centerX = root.rect.element.width * 0.5;
    const centerY = root.rect.element.height * 0.5;

    root.ref.blob = root.appendChildView(
        root.createChildView(blob, {
            opacity: 0,
            scaleX: 2.5,
            scaleY: 2.5,
            translateX: centerX,
            translateY: centerY
        })
    );
};

const moveBlob = ({ root, action }) => {
    if (!root.ref.blob) {
        addBlob({ root });
        return;
    }

    root.ref.blob.translateX = action.position.scopeLeft;
    root.ref.blob.translateY = action.position.scopeTop;
    root.ref.blob.scaleX = 1;
    root.ref.blob.scaleY = 1;
    root.ref.blob.opacity = 1;
};

const hideBlob = ({ root }) => {
    if (!root.ref.blob) {
        return;
    }
    root.ref.blob.opacity = 0;
};

const explodeBlob = ({ root }) => {
    if (!root.ref.blob) {
        return;
    }
    root.ref.blob.scaleX = 2.5;
    root.ref.blob.scaleY = 2.5;
    root.ref.blob.opacity = 0;
};

const write = ({ root, props, actions }) => {
    route({ root, props, actions });

    const { blob } = root.ref;

    if (actions.length === 0 && blob && blob.opacity === 0) {
        root.removeChildView(blob);
        root.ref.blob = null;
    }
};

const route = createRoute({
    DID_DRAG: moveBlob,
    DID_DROP: explodeBlob,
    DID_END_DRAG: hideBlob
});

export const drip = createView({
    ignoreRect: true,
    ignoreRectUpdate: true,
    name: 'drip',
    write
});
