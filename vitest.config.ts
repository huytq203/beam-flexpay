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
      alias('@constants', 'src/app/constants'),
      alias('@lib', 'src/lib'),
      alias('@icons', 'src/components/icons')
    ]
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    
    // Cấu hình giới hạn worker chuẩn cho Vitest v3:
    maxWorkers: 2,           // Tối đa 2 worker processes
    minWorkers: 1,           // Tối thiểu 1 worker
    fileParallelism: false,  // Tắt tự động nhân bản quá nhiều file test song song nếu muốn tiết kiệm RAM tối đa
    
    // Xả rác bộ nhớ giữa các file test
    isolate: true,
  }
})