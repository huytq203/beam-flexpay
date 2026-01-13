import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, loadEnv, splitVendorChunkPlugin } from 'vite'
import vitePluginImp from 'vite-plugin-imp'
import svgr from 'vite-plugin-svgr'
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const PORT = env.VITE_PORT
  return {
    base: '/',
    plugins: [
      react(),
      svgr(),
      vitePluginImp({
        optimize: true,
        libList: [
          {
            libName: 'antd',
            libDirectory: 'es',
            style: (name) => `antd/es/${name}/style`
          }
        ]
      }),
      splitVendorChunkPlugin()
      // viteCompression({
      //   verbose: true,
      //   disable: false,
      //   threshold: 102400,
      //   algorithm: 'gzip',
      //   ext: '.gz'
      // })
    ],
    resolve: {
      alias: [
        {
          find: '@assets',
          replacement: path.resolve(__dirname, 'src/styles/assets')
        },
        {
          find: '@pages',
          replacement: path.resolve(__dirname, 'src/pages')
        },
        {
          find: '@components',
          replacement: path.resolve(__dirname, 'src/components')
        },
        {
          find: '@configs',
          replacement: path.resolve(__dirname, 'src/app/configs')
        },
        {
          find: '@services',
          replacement: path.resolve(__dirname, 'src/app/services')
        },
        {
          find: '@slices',
          replacement: path.resolve(__dirname, 'src/app/slices')
        },
        {
          find: '@type',
          replacement: path.resolve(__dirname, 'src/app/types')
        },
        {
          find: '@utils',
          replacement: path.resolve(__dirname, 'src/app/utils')
        },
        {
          find: '@hooks',
          replacement: path.resolve(__dirname, 'src/app/hooks')
        },
        {
          find: '@languages',
          replacement: path.resolve(__dirname, 'src/app/languages')
        },
        {
          find: '@constants',
          replacement: path.resolve(__dirname, 'src/app/constants')
        }
      ]
    },
    server: {
      host: true,
      port: +PORT || 8000
    },
    preview: {
      host: true,
      port: +PORT || 8000
    },
    build: {
      sourcemap: false,
      manifest: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'antd': ['antd'],
            'antd-charts': ['@ant-design/charts', '@ant-design/plots'],
            'icons': ['lucide-react', '@phosphor-icons/react', '@ant-design/icons']
          }
        }
      }
    },
    optimizeDeps: {
      include: [
        'antd',
        '@ant-design/icons',
        '@ant-design/charts',
        '@ant-design/plots',
        'lucide-react',
        '@phosphor-icons/react',
        'ahooks',
        'dayjs',
        'react',
        'react-dom'
      ]
    }
  }
})
