import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'


import svgr from 'vite-plugin-svgr'
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const PORT = env.VITE_PORT
  return {
    base: '/',
    plugins: [
      react(),
      svgr(),
      // vitePluginImp({
      //   optimize: true,
      //   libList: [
      //     {
      //       libName: 'antd',
      //       libDirectory: 'es',
      //       style: (name) => `antd/es/${name}/style`
      //     }
      //   ]
      // }),
      // splitVendorChunkPlugin()
      // viteCompression({
      //   verbose: true,
      //   disable: false,
      //   threshold: 102400,
      //   algorithm: 'gzip',
      //   ext: '.gz'
      // })
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
      proxy: {
        '/proxy/admin': {
          target: env.VITE_API_URL?.replace('/api/admin', '') || 'https://cms.ewallet.devops.beamewa.com.vn',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/proxy\/admin/, '/api/admin')
        },
        '/proxy/identity': {
          target: env.VITE_API_LOGIN?.replace('/identity/api/v1/admin', '') || 'https://api.dev.ewallet.flexpay.vn',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/proxy\/identity/, '/identity/api/v1/admin')
        },
        '/proxy/wallet-core': {
          target: env.VITE_API_WALLETCORE?.replace('/wallet-core/api/v1/admin', '') || 'https://api.dev.ewallet.flexpay.vn',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/proxy\/wallet-core/, '/wallet-core/api/v1/admin')
        },
        '/proxy/fee': {
          target: env.VITE_FEE_API_URL?.replace('/fee/api/v1/admin', '') || 'https://api.dev.ewallet.flexpay.vn',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/proxy\/fee/, '/fee/api/v1/admin')
        },
        '/proxy/merchant': {
          target: env.VITE_API_MERCHANT?.replace('/merchant/api/v1/admin', '') || 'https://api.dev.ewallet.flexpay.vn',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/proxy\/merchant/, '/merchant/api/v1/admin')
        }
      }
    },
    preview: {
      host: true,
      port: +PORT || 8000
    },

  }
})
