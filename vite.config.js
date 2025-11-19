import { defineConfig } from 'vite';
import path from 'path';

import inject from '@rollup/plugin-inject';

export default defineConfig({
    plugins: [
        inject({
            $: 'jquery',
            jQuery: 'jquery',
            'window.jQuery': 'jquery',
        }),
    ],
    define: {
        VERSION: JSON.stringify(process.env.npm_package_version),
    },
    build: {
        outDir: 'static',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: path.resolve(__dirname, 'demo.html'),
                index: path.resolve(__dirname, 'index.html'),
                about: path.resolve(__dirname, 'public/about.html'), // Will be copied but we can also process it
            },
        },
    },
    base: '/static/',
    server: {
        proxy: {
            '/ws': 'ws://localhost:8058',
            '/data.json': 'http://localhost:8058',
            '/api': 'http://localhost:8058',
            '/bg': 'http://localhost:8058',
            // Proxy /static requests to the dev server root (where public/ is served)
            '/static': {
                target: 'http://localhost:5173',
                rewrite: (path) => path.replace(/^\/static/, ''),
            },
        },
    },
    resolve: {
        alias: {
            '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
        }
    }
});
