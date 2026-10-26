import { TextArea } from '@components/index'

interface PublicKeyFieldProps {
  id: string
  value: string
  error?: string
  onChange: (value: string) => void
}

// Chỉ nhận public key RSA dạng PEM; BE từ chối khóa riêng, khóa < 2048 bit
// hoặc chuỗi dài hơn 4000 ký tự.
export function PublicKeyField({
  id,
  value,
  error,
  onChange
}: PublicKeyFieldProps) {
  return (
    <div>
      <label
        className='mb-1 block text-sm font-medium'
        htmlFor={id}
      >
        Public key RSA của merchant (PEM){' '}
        <span className='text-danger-strong'>*</span>
      </label>
      <TextArea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        maxLength={4000}
        spellCheck={false}
        className='font-mono text-xs!'
        placeholder={
          '-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----'
        }
        status={error ? 'error' : undefined}
      />
      {error ? (
        <p
          role='alert'
          className='mt-1 text-xs text-danger-strong'
        >
          {error}
        </p>
      ) : (
        <p className='mt-1 text-xs text-muted-foreground'>
          Không dán khóa riêng (PRIVATE KEY). Khóa RSA tối thiểu 2048 bit.
        </p>
      )}
    </div>
  )
}
