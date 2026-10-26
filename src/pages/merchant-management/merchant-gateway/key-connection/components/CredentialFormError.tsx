/** Lỗi nghiệp vụ BE (`detail`) hiện ngay trong form đang mở. */
export function CredentialFormError({ message }: { message: string }) {
  if (!message) return null
  return (
    <p
      role='alert'
      className='rounded-lg border border-danger/40 bg-danger/10 p-3 text-xs leading-relaxed text-danger-strong'
    >
      {message}
    </p>
  )
}
