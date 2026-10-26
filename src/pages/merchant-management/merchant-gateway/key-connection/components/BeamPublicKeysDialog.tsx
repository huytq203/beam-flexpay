import {
  useGetGatewayBeamPublicKeysQuery,
  type BeamPublicKey
} from '@/app/services/merchantGatewayApi'
import { getApiErrorDetail } from '@/app/utils/api-error'
import { saveBlobAsFile } from '@utils/file-download'
import { DownloadOutlined } from '@components/icons'
import { ButtonComponent, DialogModal, TypographyText } from '@components/index'

const PURPOSE_LABEL: Record<string, string> = {
  RESPONSE_SIGNING: 'Xác thực chữ ký phản hồi của BEAM',
  PAN_ENCRYPTION: 'Mã hóa số thẻ (PAN) gửi tới BEAM'
}

const downloadPem = (key: BeamPublicKey) =>
  void saveBlobAsFile(
    new Blob([key.publicKeyPem], { type: 'application/x-pem-file' }),
    `beam-${key.purpose.toLowerCase()}-${key.keyId}.pem`
  )

function BeamPublicKeyCard({ item }: { item: BeamPublicKey }) {
  return (
    <section className='space-y-2 rounded-lg border border-border p-3'>
      <div className='flex flex-wrap items-start justify-between gap-2'>
        <div className='min-w-0'>
          <h3 className='text-sm font-semibold'>
            {PURPOSE_LABEL[item.purpose] ?? item.purpose}
          </h3>
          <p className='break-all text-xs text-muted-foreground'>
            Key ID: {item.keyId} · {item.algorithm}
          </p>
        </div>
        <ButtonComponent
          type='default'
          size='small'
          icon={<DownloadOutlined aria-hidden />}
          content='Tải file PEM'
          aria-label={`Tải PEM ${item.keyId}`}
          onClick={() => downloadPem(item)}
        />
      </div>
      <TypographyText
        className='flex w-full min-w-0 items-start gap-2!'
        copyable={{
          text: item.publicKeyPem,
          tooltips: ['Sao chép public key', 'Đã sao chép']
        }}
      >
        <pre className='min-w-0 flex-1 whitespace-pre-wrap break-all rounded-md bg-muted p-2 font-mono text-[11px] leading-4'>
          {item.publicKeyPem}
        </pre>
      </TypographyText>
    </section>
  )
}

export function BeamPublicKeysDialog({ onClose }: { onClose: () => void }) {
  const query = useGetGatewayBeamPublicKeysQuery()

  return (
    <DialogModal
      open
      width={{ xs: '95%', md: 720 }}
      title='Public key của BEAM'
      onCancel={onClose}
      onOk={onClose}
      okText='Đóng'
      cancelButtonProps={{ className: 'hidden' }}
    >
      <div className='space-y-3'>
        <p className='text-sm text-muted-foreground'>
          Gửi các public key này cho merchant để xác thực phản hồi và mã hóa dữ
          liệu thẻ khi tích hợp.
        </p>
        {query.isLoading && (
          <p className='text-sm text-muted-foreground'>Đang tải public key…</p>
        )}
        {query.isError && (
          <div
            role='alert'
            className='flex items-center justify-between gap-2 text-sm text-danger-strong'
          >
            {getApiErrorDetail(query.error, 'Không thể tải public key.')}
            <ButtonComponent
              type='default'
              size='small'
              content='Thử lại'
              onClick={() => void query.refetch()}
            />
          </div>
        )}
        {query.isSuccess && query.data.length === 0 && (
          <p className='text-sm text-muted-foreground'>
            Chưa có public key nào.
          </p>
        )}
        {query.data?.map((item) => (
          <BeamPublicKeyCard
            key={`${item.purpose}-${item.keyId}`}
            item={item}
          />
        ))}
      </div>
    </DialogModal>
  )
}
