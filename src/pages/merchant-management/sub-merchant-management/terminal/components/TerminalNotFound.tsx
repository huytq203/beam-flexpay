import { ButtonComponent } from '@components/index'

interface TerminalNotFoundProps {
  onBack: () => void
}

export function TerminalNotFound({ onBack }: TerminalNotFoundProps) {
  return (
    <section
      className='flex min-h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center'
      role='alert'
    >
      <div className='space-y-1'>
        <h1 className='font-display text-lg font-semibold text-foreground'>
          Không tìm thấy Terminal
        </h1>
        <p className='text-sm text-muted-foreground'>
          Bản ghi không tồn tại hoặc đã được cập nhật ở phiên làm việc khác.
        </p>
      </div>
      <ButtonComponent
        content='Về danh sách Terminal'
        htmlType='button'
        onClick={onBack}
        type='default'
      />
    </section>
  )
}
