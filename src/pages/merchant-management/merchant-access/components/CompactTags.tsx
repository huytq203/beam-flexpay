import { TagComponent, TooltipComponent } from '@components/index'

export function CompactTags({
  names,
  emptyLabel,
  color
}: {
  names: string[]
  emptyLabel: string
  color?: string
}) {
  if (names.length === 0)
    return (
      <span className='text-xs font-medium text-warning-strong'>
        {emptyLabel}
      </span>
    )
  return (
    <div className='flex max-w-48 flex-wrap gap-1'>
      {names.slice(0, 2).map((name) => (
        <TagComponent
          color={color}
          key={name}
          className='m-0 max-w-44 truncate'
        >
          {name}
        </TagComponent>
      ))}
      {names.length > 2 && (
        <TooltipComponent title={names.join(', ')}>
          <TagComponent className='m-0'>+{names.length - 2}</TagComponent>
        </TooltipComponent>
      )}
    </div>
  )
}
