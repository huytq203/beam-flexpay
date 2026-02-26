import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'


import svgr from 'vite-plugin-svgr'
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const PORT = env.VITE_PORT
  const useProxy = env.VITE_PROXY === 'true'

  const proxyConfig = useProxy
    ? {
        '/proxy-api': {
          target: env.VITE_PROXY_API_TARGET || 'https://api.dev.ewallet.flexpay.vn',
          changeOrigin: true,
          secure: false,
          rewrite: (p: string) => p.replace(/^\/proxy-api/, ''),
          headers: {
            Origin: env.VITE_PROXY_API_TARGET || 'https://api.dev.ewallet.flexpay.vn',
            Referer: (env.VITE_PROXY_API_TARGET || 'https://api.dev.ewallet.flexpay.vn') + '/',
          },
        },
        '/proxy-cms': {
          target: env.VITE_PROXY_CMS_TARGET || 'https://cms.ewallet.devops.beamewa.com.vn',
          changeOrigin: true,
          secure: false,
          rewrite: (p: string) => p.replace(/^\/proxy-cms/, ''),
          headers: {
            Origin: env.VITE_PROXY_CMS_TARGET || 'https://cms.ewallet.devops.beamewa.com.vn',
            Referer: (env.VITE_PROXY_CMS_TARGET || 'https://cms.ewallet.devops.beamewa.com.vn') + '/',
          },
        },
      }
    : undefined

  return {
    base: '/',
    plugins: [
      react(),
      svgr(),
    ],
    build: {
      sourcemap: false,
      manifest: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            antd: ['antd'],
            icons: ['@ant-design/icons', '@phosphor-icons/react', 'lucide-react']
          }
        }
      }
    },
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
      port: +PORT || 8000,
      proxy: proxyConfig,
    },
    preview: {
      host: true,
      port: +PORT || 8000
    },
  }
})
