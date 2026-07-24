// Vercel Edge Function proxy.
// Thay cho rewrite thuần: nhận /proxy-api/* và /proxy-cms/* rồi forward tới
// backend với Origin/Referer đã được ghi đè giống hệt Vite dev proxy
// (vite.config.ts), nếu không backend sẽ trả 403 vì Origin là domain vercel.app.

export const config = { runtime: 'edge' }

const TARGETS: Record<string, string> = {
  'proxy-api': 'https://api.dev.ewallet.flexpay.vn',
  'proxy-cms': 'https://cms.ewallet.devops.beamewa.com.vn',
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)

  // pathname dạng: /api/proxy/proxy-api/identity/api/v1/admin/auth/login
  const segments = url.pathname.replace(/^\/api\/proxy\//, '').split('/')
  const prefix = segments.shift() // 'proxy-api' | 'proxy-cms'
  const target = prefix ? TARGETS[prefix] : undefined

  if (!target) {
    return new Response(`Unknown proxy target: ${prefix}`, { status: 404 })
  }

  const targetOrigin = new URL(target).origin
  const targetUrl = `${target}/${segments.join('/')}${url.search}`

  // Sao chép header của client, ghi đè Origin/Referer để giả request nội bộ.
  const headers = new Headers(req.headers)
  headers.set('origin', targetOrigin)
  headers.set('referer', `${targetOrigin}/`)
  // Không forward host của vercel.app; fetch sẽ tự set host theo targetUrl.
  headers.delete('host')

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD'

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: hasBody ? req.body : undefined,
    redirect: 'manual',
    // Cần khi truyền ReadableStream làm body trên runtime Edge/undici.
    ...(hasBody ? { duplex: 'half' } : {}),
  } as RequestInit)

  // Body đã được runtime giải nén; xoá các header gây double-decode phía browser.
  const respHeaders = new Headers(upstream.headers)
  respHeaders.delete('content-encoding')
  respHeaders.delete('content-length')
  respHeaders.delete('transfer-encoding')

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: respHeaders,
  })
}
