import { Plugin } from 'vite';

export function fullReloadAlways(): Plugin {
    return {
        name: 'vite-plugin-full-reload-always',
        handleHotUpdate({ server }: any) {
            server.ws.send({ type: 'full-reload' });
            return [];
        },
    };
}
