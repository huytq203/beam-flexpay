import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import svgr from 'vite-plugin-svgr';
import tailwindcss from '@tailwindcss/vite';
const DEFAULT_API_TARGET = 'https://api.dev.ewallet.flexpay.vn';
const DEFAULT_CMS_TARGET = 'https://cms.ewallet.devops.beamewa.com.vn';
// Các biến env chứa base URL service. Mỗi biến TỰ quyết định backend của nó,
// nên đổi 1 service sang local không kéo theo các service còn lại.
const SERVICE_ENV_KEYS = [
    'VITE_API_URL',
    'VITE_IMAGE_URL',
    'VITE_FEE_API_URL',
    'VITE_API_USER_WALLET',
    'VITE_API_LOGIN',
    'VITE_API_WALLETCORE',
    'VITE_API_MERCHANT',
];
const getOrigin = (value) => {
    try {
        return new URL(value ?? '').origin;
    }
    catch {
        return undefined;
    }
};
// Origin lạ (localhost, staging...) được cấp prefix riêng:
// http://localhost:8081 -> /proxy-localhost-8081
const toProxyPrefix = (origin) => {
    const { hostname, port, protocol } = new URL(origin);
    const normalizedPort = port || (protocol === 'https:' ? '443' : '80');
    return `/proxy-${hostname.replace(/[^a-zA-Z0-9]/g, '-')}-${normalizedPort}`;
};
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const isProduction = mode === 'production';
    const PORT = env.VITE_PORT;
    const useProxy = env.VITE_PROXY === 'true';
    // Bảng origin -> prefix proxy. Giữ cố định /proxy-api và /proxy-cms để khớp
    // rewrite phía Vercel (vercel.json + api/proxy.ts).
    const prefixByOrigin = new Map();
    if (useProxy) {
        prefixByOrigin.set(getOrigin(env.VITE_PROXY_API_TARGET) ?? DEFAULT_API_TARGET, '/proxy-api');
        prefixByOrigin.set(getOrigin(env.VITE_PROXY_CMS_TARGET) ?? DEFAULT_CMS_TARGET, '/proxy-cms');
        for (const key of SERVICE_ENV_KEYS) {
            const origin = getOrigin(env[key]);
            if (!origin || prefixByOrigin.has(origin))
                continue;
            prefixByOrigin.set(origin, toProxyPrefix(origin));
        }
    }
    const proxyConfig = useProxy
        ? Object.fromEntries([...prefixByOrigin]
            // Prefix dài đứng trước để /proxy-api không "nuốt" /proxy-api-dev-...
            .sort(([, a], [, b]) => b.length - a.length)
            .map(([origin, prefix]) => [
            prefix,
            {
                target: origin,
                changeOrigin: true,
                secure: false,
                rewrite: (p) => p.slice(prefix.length),
                headers: {
                    Referer: `${origin}/`,
                },
            },
        ]))
        : undefined;
    const defineEnv = {};
    if (useProxy) {
        // Ghi đè base URL thành /proxy-... theo đúng origin của từng service
        for (const key of SERVICE_ENV_KEYS) {
            const rawUrl = env[key];
            const origin = getOrigin(rawUrl);
            const prefix = origin ? prefixByOrigin.get(origin) : undefined;
            if (!origin || !prefix)
                continue;
            defineEnv[`import.meta.env.${key}`] = JSON.stringify(prefix + rawUrl.slice(origin.length));
        }
    }
    return {
        define: defineEnv,
        base: '/',
        plugins: [
            tailwindcss(),
            react(),
            svgr(),
            isProduction && VitePWA({
                registerType: 'autoUpdate',
                devOptions: {
                    enabled: false,
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
            })
        ].filter(Boolean),
        optimizeDeps: {
            include: [
                '@phosphor-icons/react',
                '@phosphor-icons/react/dist/ssr',
                'react-resizable-panels',
                'sweetalert2',
                'tailwind-variants'
            ]
        },
        build: {
            sourcemap: false,
            manifest: true,
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        if (id.includes('node_modules')) {
                            if (id.includes('antd')) {
                                return 'antd';
                            }
                            if (id.includes('react') ||
                                id.includes('react-dom') ||
                                id.includes('react-router-dom')) {
                                return 'vendor';
                            }
                            if (id.includes('@ant-design/icons') ||
                                id.includes('@phosphor-icons/react') ||
                                id.includes('lucide-react')) {
                                return 'icons';
                            }
                        }
                    }
                }
            }
        },
        resolve: {
            alias: [
                {
                    find: '@',
                    replacement: path.resolve(__dirname, 'src')
                },
                {
                    find: '@icon',
                    replacement: path.resolve(__dirname, 'src/components/icon')
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
                },
                {
                    find: '@lib',
                    replacement: path.resolve(__dirname, 'src/lib')
                },
                {
                    find: '@icons',
                    replacement: path.resolve(__dirname, 'src/components/icons')
                }
            ]
        },
        server: {
            host: true,
            port: PORT ? +PORT : undefined,
            strictPort: Boolean(PORT),
            proxy: proxyConfig,
            open: false,
        },
        preview: {
            host: true,
            port: PORT ? +PORT : undefined,
            open: false,
        },
    };
});
