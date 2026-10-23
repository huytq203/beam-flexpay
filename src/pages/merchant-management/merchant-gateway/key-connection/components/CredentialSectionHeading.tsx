export function CredentialSectionHeading({
  index,
  title,
  divided = false
}: {
  index: string
  title: string
  divided?: boolean
}) {
  return (
    <div
      className={
        divided
          ? 'col-span-full mt-1 flex items-center gap-2 border-t border-border pt-4'
          : 'col-span-full flex items-center gap-2'
      }
    >
      <span
        aria-hidden
        className='flex size-6 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground'
      >
        {index}
      </span>
      <h2 className='text-xs font-semibold uppercase tracking-[0.05em] text-secondary-foreground'>
        {title}
      </h2>
    </div>
  )
}
