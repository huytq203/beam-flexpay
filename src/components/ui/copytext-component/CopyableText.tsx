import { useState } from 'react'

import { CopyIcon } from '@components/icons'
import { cn } from '@utils/cn'

import ButtonComponent from '../button-component'
import TooltipComponent from '../tooltip-component'

interface CopyableTextProps {
  value: string
  label?: string
  className?: string
}

const CopyableText: React.FC<CopyableTextProps> = ({ value, label, className }) => {
  const [tooltipTitle, setTooltipTitle] = useState('Sao chép')
  const copyLabel = label ? `Sao chép ${label}: ${value}` : `Sao chép ${value}`

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(value)
      setTooltipTitle('Đã sao chép')
    } catch {
      setTooltipTitle('Không thể sao chép')
    }
  }

  return (
    <div className='flex flex-col gap-1'>
      <div className='flex items-center gap-1 text-gray-500'>
        {label && <span>{label}</span>}
      </div>

      <div className={cn('flex items-center gap-1 font-medium', className)}>
        <span className='truncate' title={value}>{value}</span>
        <TooltipComponent title={tooltipTitle}>
          <ButtonComponent
            aria-label={copyLabel}
            className='size-6! shrink-0 p-0! text-gray-500! hover:text-blue-500!'
            htmlType='button'
            icon={<CopyIcon aria-hidden />}
            onClick={() => void handleCopy()}
            onMouseEnter={() => setTooltipTitle('Sao chép')}
            type='text'
          />
        </TooltipComponent>
      </div>
    </div>
  )
}

export default CopyableText
