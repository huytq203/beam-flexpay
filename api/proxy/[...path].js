const PROXY_CONFIG = {
    '/proxy/admin': {
        target: process.env.VITE_API_URL || 'https://cms.ewallet.devops.beamewa.com.vn/api/admin'
    },
    '/proxy/identity': {
        target: process.env.VITE_API_LOGIN || 'https://api.dev.ewallet.flexpay.vn/identity/api/v1/admin'
    },
    '/proxy/wallet-core': {
        target: process.env.VITE_API_WALLETCORE || 'https://api.dev.ewallet.flexpay.vn/wallet-core/api/v1/admin'
    },
    '/proxy/fee': {
        target: process.env.VITE_FEE_API_URL || 'https://api.dev.ewallet.flexpay.vn/fee/api/v1/admin'
    },
    '/proxy/merchant': {
        target: process.env.VITE_API_MERCHANT || 'https://api.dev.ewallet.flexpay.vn/merchant/api/v1/admin'
    }
}

function getProxyConfig(path) {
    for (const [prefix, config] of Object.entries(PROXY_CONFIG)) {
        if (path.startsWith(prefix)) {
            return { prefix, ...config }
        }
    }
    return null
}

module.exports = async (req, res) => {
    const config = getProxyConfig(req.url)
    if (!config) {
        return res.status(404).json({ error: 'Proxy route not found' })
    }

    const targetPath = req.url.replace(new RegExp(`^${config.prefix.replace('/', '\\/')}`), '')
    const targetUrl = config.target + targetPath
    const url = new URL(config.target)

    const forwardHeaders = {}
    const skipRequestHeaders = new Set([
        'host', 'x-forwarded-host', 'x-vercel-id',
        'x-vercel-deployment-url', 'x-vercel-forwarded-for',
        'x-real-ip', 'connection'
    ])

    for (const [key, value] of Object.entries(req.headers)) {
        if (!skipRequestHeaders.has(key.toLowerCase())) {
            forwardHeaders[key] = value
        }
    }
    forwardHeaders['host'] = url.host
    forwardHeaders['origin'] = url.origin

    try {
        let body = undefined
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            const chunks = []
            for await (const chunk of req) {
                chunks.push(chunk)
            }
            if (chunks.length > 0) {
                body = Buffer.concat(chunks)
            }
        }

        const response = await fetch(targetUrl, {
            method: req.method,
            headers: forwardHeaders,
            body,
            redirect: 'follow'
        })

        const skipResponseHeaders = new Set(['transfer-encoding', 'content-encoding', 'connection'])
        response.headers.forEach((value, key) => {
            if (!skipResponseHeaders.has(key.toLowerCase())) {
                res.setHeader(key, value)
            }
        })

        const buffer = Buffer.from(await response.arrayBuffer())
        res.status(response.status).send(buffer)
    } catch (error) {
        console.error('Proxy error:', error)
        res.status(502).json({ error: 'Proxy failed', message: error.message })
    }
}
