import { useEffect, useState } from 'react'

const VIETQR_BANKS_URL = 'https://api.vietqr.io/v2/banks'
const VIETQR_LOGO_HOSTS = new Set(['api.vietqr.io', 'cdn.vietqr.io'])

interface VietQrBank {
  code?: string
  shortName?: string
  logo?: string
}

interface VietQrBanksResponse {
  data?: VietQrBank[]
}

let bankDirectoryPromise: Promise<VietQrBank[]> | undefined
const logoCache = new Map<string, string>()

const safeLogoUrl = (value?: string) => {
  if (!value) return undefined

  try {
    const url = new URL(value)
    return url.protocol === 'https:' && VIETQR_LOGO_HOSTS.has(url.hostname)
      ? url.toString()
      : undefined
  } catch {
    return undefined
  }
}

const getBankDirectory = () => {
  if (!bankDirectoryPromise) {
    bankDirectoryPromise = fetch(VIETQR_BANKS_URL, {
      cache: 'force-cache',
      credentials: 'omit',
      headers: { Accept: 'application/json' },
      referrerPolicy: 'no-referrer'
    })
      .then((response) => {
        if (!response.ok) throw new Error(`VietQR bank directory returned ${response.status}`)
        return response.json() as Promise<VietQrBanksResponse>
      })
      .then((response) => Array.isArray(response.data) ? response.data : [])
      .catch((error) => {
        bankDirectoryPromise = undefined
        throw error
      })
  }

  return bankDirectoryPromise
}

/**
 * Lấy logo ngân hàng từ danh mục công khai của VietQR.
 * Request không mang cookie/token và được cache trong suốt phiên chạy của ứng dụng.
 */
const useBankLogo = (bankCode?: string) => {
  const normalizedBankCode = bankCode?.trim().toUpperCase()
  const [resolvedLogo, setResolvedLogo] = useState<{
    bankCode: string
    logoUrl?: string
  }>()
  const cachedLogo = normalizedBankCode ? logoCache.get(normalizedBankCode) : undefined
  const logoUrl = cachedLogo ?? (
    resolvedLogo && resolvedLogo.bankCode === normalizedBankCode
      ? resolvedLogo.logoUrl
      : undefined
  )

  useEffect(() => {
    let isActive = true

    if (!normalizedBankCode) return

    if (logoCache.has(normalizedBankCode)) return

    void getBankDirectory()
      .then((banks) => {
        const bank = banks.find((item) => (
          item.code?.toUpperCase() === normalizedBankCode
          || item.shortName?.toUpperCase() === normalizedBankCode
        ))
        const nextLogoUrl = safeLogoUrl(bank?.logo)

        if (nextLogoUrl) logoCache.set(normalizedBankCode, nextLogoUrl)
        if (isActive) {
          setResolvedLogo({ bankCode: normalizedBankCode, logoUrl: nextLogoUrl })
        }
      })
      .catch(() => undefined)

    return () => {
      isActive = false
    }
  }, [normalizedBankCode])

  return logoUrl
}

export default useBankLogo
