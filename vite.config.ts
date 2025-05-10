import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    base: '/AI-Playground/', // ← имя твоего репозитория
    plugins: [tailwindcss()],
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: './index.html'
        }
    },
    server: {
        watch: {
            ignored: ['**/*.fs']
        }
    }
})
