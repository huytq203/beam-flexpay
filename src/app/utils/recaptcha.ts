import { useEffect } from 'react'

/**
 * reCAPTCHA v3 - tích hợp thủ công (KHÔNG dùng react-google-recaptcha-v3).
 *
 * Lý do: GoogleReCaptchaProvider của lib không tương thích React 19 — nó
 * re-render cây con khiến CSSMotion của antd (Button loading icon) lặp vô hạn
 * ("Maximum update depth exceeded"). Ở đây ta tự nạp script 1 lần và gọi
 * grecaptcha.execute trực tiếp, không cần React provider.
 */

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string

const SCRIPT_ID = 'google-recaptcha-v3'

/** Bề mặt API của grecaptcha v3 mà file này sử dụng. */
interface GrecaptchaV3 {
  ready: (callback: () => void) => void
  execute: (siteKey: string, options: { action: string }) => Promise<string>
}

declare global {
  interface Window {
    grecaptcha?: GrecaptchaV3
  }
}

const LOAD_TIMEOUT_MS = 10_000
const MAX_LOAD_ATTEMPTS = 3

let loadPromise: Promise<void> | null = null

/** Thử nạp script 1 lần; lỗi hoặc quá hạn thì gỡ thẻ script hỏng để lần sau nạp lại được. */
function attemptLoad(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    document.getElementById(SCRIPT_ID)?.remove()
    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`
    script.async = true
    script.defer = true

    const fail = () => {
      clearTimeout(timer)
      script.remove()
      reject(new Error('Không tải được reCAPTCHA'))
    }
    const timer = setTimeout(fail, LOAD_TIMEOUT_MS)
    script.onload = () => {
      clearTimeout(timer)
      resolve()
    }
    script.onerror = fail
    document.head.appendChild(script)
  })
}

async function loadWithRetry(): Promise<void> {
  for (let attempt = 1; ; attempt++) {
    try {
      await attemptLoad()
      return
    } catch (error) {
      if (attempt >= MAX_LOAD_ATTEMPTS) throw error
    }
  }
}

function loadScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.grecaptcha?.execute) return Promise.resolve()
  if (loadPromise) return loadPromise

  loadPromise = loadWithRetry().catch((error: unknown) => {
    loadPromise = null
    throw error
  })
  return loadPromise
}

/** Sinh token reCAPTCHA cho 1 action. Throw nếu không tải/khởi tạo được. */
export async function executeRecaptcha(action: string): Promise<string> {
  await loadScript()
  const grecaptcha = window.grecaptcha
  if (!grecaptcha?.execute) throw new Error('reCAPTCHA chưa sẵn sàng')
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error('reCAPTCHA khởi tạo quá lâu')),
      LOAD_TIMEOUT_MS
    )
    grecaptcha.ready(() => {
      clearTimeout(timer)
      resolve()
    })
  })
  return grecaptcha.execute(SITE_KEY, { action })
}

/** Gỡ script + badge khỏi DOM để reCAPTCHA không còn hiển thị/hoạt động ngoài màn login. */
function unloadScript(): void {
  if (typeof window === 'undefined') return
  document.getElementById(SCRIPT_ID)?.remove()
  document.querySelectorAll('.grecaptcha-badge').forEach((el) => el.remove())
  delete window.grecaptcha
  loadPromise = null
}

/**
 * Drop-in thay cho useGoogleReCaptcha của lib: tự nạp script khi mount và
 * trả về { executeRecaptcha } cùng chữ ký, để component dùng như cũ.
 *
 * Gỡ script + badge khi unmount, vì badge được chèn thẳng vào document.body
 * (ngoài cây React) nên nếu không dọn, nó sẽ nổi cố định trên mọi trang sau
 * khi rời khỏi màn login.
 */
export function useGoogleReCaptcha() {
  useEffect(() => {
    loadScript().catch(() => {})
    return unloadScript
  }, [])
  return { executeRecaptcha }
}
