// Vercel Edge Function proxy (đường dẫn tĩnh, KHÔNG dùng catch-all [...] để chắc
// chắn Vercel nhận diện được là Function).
//
// vercel.json rewrite mọi /proxy-api/* và /proxy-cms/* về đây kèm 2 param điều
// khiển: __t (target) và __p (phần path còn lại). Function ghi đè Origin/Referer
// thành domain backend rồi forward — giống hệt Vite dev proxy (vite.config.ts),
// nếu không backend trả 403 vì Origin là domain vercel.app.

export const config = { runtime: 'edge' }

const TARGETS: Record<string, string> = {
  api: 'https://api.dev.ewallet.flexpay.vn',
  cms: 'https://cms.ewallet.devops.beamewa.com.vn',
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)

  const t = url.searchParams.get('__t') // 'api' | 'cms'
  const p = url.searchParams.get('__p') ?? '' // phần path sau prefix
  const target = t ? TARGETS[t] : undefined

  if (!target) {
    return new Response(`Unknown proxy target: ${t}`, { status: 404 })
  }

  // Bỏ 2 param điều khiển, phần còn lại là query thật của client cần forward.
  url.searchParams.delete('__t')
  url.searchParams.delete('__p')
  const qs = url.searchParams.toString()

  const targetOrigin = new URL(target).origin
  const targetUrl = `${target}/${p}${qs ? `?${qs}` : ''}`

  // Sao chép header client, ghi đè Origin/Referer để giả request nội bộ.
  const headers = new Headers(req.headers)
  headers.set('origin', targetOrigin)
  headers.set('referer', `${targetOrigin}/`)
  headers.delete('host') // fetch tự set host theo targetUrl

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD'

  const upstream = await fetch(targetUrl, {
    method: req.method,
    headers,
    body: hasBody ? req.body : undefined,
    redirect: 'manual',
    // Cần khi truyền ReadableStream làm body trên runtime Edge/undici.
    ...(hasBody ? { duplex: 'half' } : {}),
  } as RequestInit)

  // Body đã được runtime giải nén; xoá header gây double-decode phía browser.
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
