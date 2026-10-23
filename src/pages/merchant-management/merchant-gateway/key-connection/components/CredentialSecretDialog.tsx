import type { CredentialSecret } from '@/app/services/merchantGatewayApi'
import { DialogModal, TypographyText } from '@components/index'

function CredentialCopyField({
  label,
  value
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <p className='mb-1 block text-sm font-medium'>{label}</p>
      <div className='flex min-h-12 items-center rounded-lg border border-border bg-muted px-3 py-1.5'>
        <TypographyText
          className='flex w-full min-w-0 items-center gap-2!'
          copyable={{
            text: value,
            tooltips: [`Sao chép ${label}`, `Đã sao chép ${label}`]
          }}
        >
          <code className='min-w-0 flex-1 break-all font-mono text-xs leading-5 text-foreground border-none! bg-transparent!'>
            {value}
          </code>
        </TypographyText>
      </div>
    </div>
  )
}

interface CredentialSecretDialogProps {
  secret: CredentialSecret | null
  onClose: () => void
}

export function CredentialSecretDialog({
  secret,
  onClose
}: CredentialSecretDialogProps) {
  return (
    <DialogModal
      open={secret !== null}
      title='Thông tin key kết nối'
      onCancel={onClose}
      onOk={onClose}
      okText='Đã lưu thông tin'
    >
      <p className='mb-4 text-sm text-warning-strong'>
        {secret?.secretKey
          ? 'Secret Key chỉ hiển thị một lần. Hãy sao chép và lưu vào nơi an toàn trước khi đóng.'
          : 'Key RSA không có Secret Key: merchant ký request bằng khóa riêng tương ứng với public key đã nộp.'}
      </p>
      {secret && (
        <div className='space-y-4'>
          <CredentialCopyField
            label='Client ID / Merchant Key'
            value={secret.credential.clientId}
          />
          {secret.secretKey && (
            <CredentialCopyField
              label='Secret Key'
              value={secret.secretKey}
            />
          )}
        </div>
      )}
    </DialogModal>
  )
}
