import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
    define: {
        '__APP_VERSION__': JSON.stringify(process.env.npm_package_version),
    },
    build: {
        outDir: 'docs'
    },
    plugins: [
        svelte(),
        // Na razie wyłączone - wymaga dotestowania
        // VitePWA({
        //     registerType: 'autoUpdate',
        //     manifestFilename: 'manifest.json',
        //     manifest: {
        //         short_name: 'QuanStats',
        //         background_color: '#242424',
        //         theme_color: '#242424',
        //         icons: [
        //             {
        //                 src: 'icon-144x144.png',
        //                 sizes: '144x144',
        //                 type: 'image/png'
        //             },
        //             {
        //                 src: 'icon-192x192.png',
        //                 sizes: '192x192',
        //                 type: 'image/png'
        //             },
        //             {
        //                 src: 'icon-512x512.png',
        //                 sizes: '512x512',
        //                 type: 'image/png'
        //             },
        //             {
        //                 src: 'icon-512x512.png',
        //                 sizes: '512x512',
        //                 type: 'image/png',
        //                 purpose: 'any maskable'
        //             },
        //         ]
        //     },
        //     workbox: {
        //         globPatterns: ['**/*.{js,css,html,png,json}']
        //     },
        //     devOptions: {
        //         enabled: true
        //     }
        // })
    ],
// @ts-ignore
    test: {
        globals: true,
    },
})
