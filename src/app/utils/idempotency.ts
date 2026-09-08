/**
 * Khoá idempotency cho lệnh tiền của wallet-core.
 *
 * Không phải endpoint nào cũng nhận — xem bảng ở `apiWalletAccount.api.ts`.
 * Gửi thừa vào DTO không khai field này là bị chặn INVALID_REQUEST 1006.
 */

const randomBytes = (length: number): Uint8Array => {
  const bytes = new Uint8Array(length)

  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes)
    return bytes
  }

  for (let index = 0; index < length; index += 1) {
    bytes[index] = Math.floor(Math.random() * 256)
  }
  return bytes
}

const formatUuidV4 = (bytes: Uint8Array): string => {
  const value = Uint8Array.from(bytes)
  value[6] = (value[6] & 0x0f) | 0x40
  value[8] = (value[8] & 0x3f) | 0x80

  const hex = Array.from(value, (byte) => byte.toString(16).padStart(2, '0'))
  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join('')
  ].join('-')
}

/**
 * `crypto.randomUUID` chỉ có trong secure context (https / localhost). CMS chạy
 * sau proxy HTTP nội bộ vẫn phải gửi được lệnh, nên có đường lùi tự dựng UUID v4.
 */
export const createIdempotencyKey = (): string =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : formatUuidV4(randomBytes(16))
