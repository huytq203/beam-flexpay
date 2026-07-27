import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

const alias = (name: string, target: string) => ({
  find: name,
  replacement: path.resolve(__dirname, target)
})

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      alias('@', 'src'),
      alias('@pages', 'src/pages'),
      alias('@components', 'src/components'),
      alias('@configs', 'src/app/configs'),
      alias('@services', 'src/app/services'),
      alias('@slices', 'src/app/slices'),
      alias('@type', 'src/app/types'),
      alias('@utils', 'src/app/utils'),
      alias('@hooks', 'src/app/hooks'),
      alias('@languages', 'src/app/languages'),
      alias('@constants', 'src/app/constants')
    ]
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}']
  }
})
