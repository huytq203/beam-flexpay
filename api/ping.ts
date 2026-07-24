// Diagnostic function: nếu GET /api/ping trả về "pong" nghĩa là Vercel CÓ build
// các function trong /api. Nếu trả về index.html thì Vercel không build /api ->
// lỗi cấu hình project (Root Directory / Framework), không phải lỗi code.
export const config = { runtime: 'edge' }

export default function handler(): Response {
  return new Response('pong', {
    headers: { 'content-type': 'text/plain' },
  })
}
