// Key cấp ở Master và các cấp dưới dùng lại; nhắc để người tạo hiểu phạm vi
// ảnh hưởng khi thu hồi.
export function CredentialScopeNotice() {
  return (
    <div className='rounded-lg border border-border bg-muted/30 p-3'>
      <p className='mb-2 text-xs font-semibold text-secondary-foreground'>
        Key áp dụng theo cây Merchant
      </p>
      <div className='flex flex-wrap items-center gap-2 text-xs'>
        <span className='rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1.5 font-semibold text-secondary-foreground'>
          Master · cấp key
        </span>
        <span
          aria-hidden
          className='text-muted-foreground'
        >
          →
        </span>
        <span className='rounded-md border border-border bg-background px-2.5 py-1.5 text-foreground'>
          Sub-merchant · kế thừa
        </span>
        <span
          aria-hidden
          className='text-muted-foreground'
        >
          →
        </span>
        <span className='rounded-md border border-border bg-background px-2.5 py-1.5 text-foreground'>
          Terminal · kế thừa
        </span>
      </div>
      <p className='mt-2 text-xs leading-relaxed text-muted-foreground'>
        Key được cấp tại Master và dùng chung cho các cấp trực thuộc. Thu hồi
        key sẽ ảnh hưởng đến toàn bộ tích hợp đang dùng key này.
      </p>
    </div>
  )
}
