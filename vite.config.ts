import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    base: '/AI-Playground-Perceptron-Maze-Solver/',
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
