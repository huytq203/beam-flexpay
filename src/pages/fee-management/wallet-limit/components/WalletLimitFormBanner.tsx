import { ButtonComponent } from '@components/index'

export interface WalletLimitFormBannerState {
  /** `conflict`: lệch `rowVersion`, cần tải lại; `error`: câu lỗi hiển thị thẳng. */
  kind: 'conflict' | 'error'
  message: string
}

interface WalletLimitFormBannerProps {
  banner: WalletLimitFormBannerState | null
  isReloading: boolean
  onReload: () => void
}

export function WalletLimitFormBanner({
  banner,
  isReloading,
  onReload
}: WalletLimitFormBannerProps) {
  if (!banner) return null
  return (
    <div
      role='alert'
      className='flex flex-wrap items-center justify-between gap-2 rounded-xl border border-danger-strong/40 bg-danger/10 px-3 py-2.5 text-sm text-danger-strong'
    >
      <span>{banner.message}</span>
      {banner.kind === 'conflict' && (
        <ButtonComponent
          type='default'
          size='small'
          htmlType='button'
          loading={isReloading}
          content='Tải lại cấu hình'
          onClick={onReload}
        />
      )}
    </div>
  )
}
