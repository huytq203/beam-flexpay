import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

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

  const defineEnv: Record<string, string> = {}
  if (useProxy) {
    const apiTarget = env.VITE_PROXY_API_TARGET || 'https://api.dev.ewallet.flexpay.vn'
    const cmsTarget = env.VITE_PROXY_CMS_TARGET || 'https://cms.ewallet.devops.beamewa.com.vn'

    // Ghi đè các biến môi trường thành dạng /proxy-... thay vì HTTP absolute khi bật proxy
    defineEnv['import.meta.env.VITE_API_URL'] = JSON.stringify(env.VITE_API_URL?.replace(cmsTarget, '/proxy-cms'))
    defineEnv['import.meta.env.VITE_IMAGE_URL'] = JSON.stringify(env.VITE_IMAGE_URL?.replace(cmsTarget, '/proxy-cms'))
    defineEnv['import.meta.env.VITE_FEE_API_URL'] = JSON.stringify(env.VITE_FEE_API_URL?.replace(apiTarget, '/proxy-api'))
    defineEnv['import.meta.env.VITE_API_LOGIN'] = JSON.stringify(env.VITE_API_LOGIN?.replace(apiTarget, '/proxy-api'))
    defineEnv['import.meta.env.VITE_API_WALLETCORE'] = JSON.stringify(env.VITE_API_WALLETCORE?.replace(apiTarget, '/proxy-api'))
    defineEnv['import.meta.env.VITE_API_MERCHANT'] = JSON.stringify(env.VITE_API_MERCHANT?.replace(apiTarget, '/proxy-api'))
  }

  return {
    define: defineEnv,
    base: '/',
    plugins: [
      react(),
      svgr(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true,
          type: 'module'
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024 // tăng lên 6MB
        },
        manifest: {
          name: 'Beam Ewallet CMS',
          short_name: 'Beam CMS',
          description: 'Beam Ewallet CMS Management Web Application',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          icons: [
            {
              src: '/images/BEAM.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/images/BEAM.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        }
      }),
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
      open: true,
    },
    preview: {
      host: true,
      port: +PORT || 8000,
      open: true,
    },
  }
})
