export const requiredLabel = (label: string) => (
  <span>
    {label}
    <span
      aria-hidden='true'
      className='ml-1 text-danger-strong'
    >
      *
    </span>
  </span>
)

export const uploadFieldClassName =
  'flex flex-col gap-2 [&_.ant-upload-drag]:min-h-28 [&_.ant-upload-drag]:rounded-lg! [&_.ant-upload-drag]:border-border! [&_.ant-upload-drag]:bg-muted/40! [&_.ant-upload-drag]:px-3! [&_.ant-upload-drag]:py-4! [&_.ant-upload-drag-icon]:mb-2! [&_.ant-upload-text]:m-0! [&_.ant-upload-text]:text-sm! [&_.ant-upload-text]:text-foreground! [&_.anticon]:text-primary!'
