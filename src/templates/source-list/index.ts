import { Button } from '../../elements/components/Button/index.js';
import { supportsDisplayTransition } from '../../utils/support.js';
import { getAsButtonProps } from '../common/index.js';
import type { NodeContext } from '../../types/index.js';

export function createFilePondSourceList() {
    return [
        {
            tag: 'ul',
            attrs: {
                role: 'list',
                part: 'source-list',
            },
            item: {
                tag: 'li',
                attrs: {
                    role: 'listitem',
                    part: 'source-list-item',
                },
                children: {
                    component: Button,
                    props: (props: any, context: NodeContext) => {
                        let {
                            disabled,
                            icon,
                            label,
                            title,
                            onclick,
                            command,
                            commandfor,
                            onopen,
                            onopened,
                            onclose,
                            onclosed,
                        } = props;

                        const { dialog } = context;

                        // if no onclick supplied we set up our own onclick handler that links up the button with the sources dialog
                        if (!onclick) {
                            command = command || 'show-modal';
                            commandfor = commandfor || dialog;

                            onclick = function (e: Event) {
                                dialog.ontransitionend = function (e: TransitionEvent) {
                                    if (e.target !== dialog) {
                                        return;
                                    }

                                    if (supportsDisplayTransition()) {
                                        if (!dialog.open && e.propertyName === 'display') {
                                            // dialog now fully faded out
                                            onclosed?.(context);
                                            return;
                                        }
                                    }

                                    if (
                                        e.propertyName === 'opacity' &&
                                        e.pseudoElement === '' &&
                                        dialog.open
                                    ) {
                                        // dialog now fully faded in
                                        onopened?.(context);
                                        return;
                                    }
                                };

                                dialog.ontoggle = function () {
                                    if (dialog.open) {
                                        // dialog now fading in
                                        onopen?.(context);
                                    } else {
                                        // dialog now fading out
                                        onclose?.(context);

                                        if (!supportsDisplayTransition()) {
                                            onclosed?.(context);
                                        }
                                    }
                                };
                            };
                        }

                        return {
                            ...getAsButtonProps({
                                icon,
                                label,
                                title,
                            }),
                            disabled,
                            part: 'source-button',
                            command,
                            commandfor,
                            onclick,
                        };
                    },
                },
            },
        },
    ];
}
