import { SIZE_ICON } from '@constants/appConstant'
import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { Button, ButtonProps } from 'antd'
import { useTranslation } from 'react-i18next'

interface ButtonSearchProps extends ButtonProps {
  label?: string
  className?: string
}

const ButtonSearch = (props: ButtonSearchProps) => {
  const { t: trans } = useTranslation()

  const { label, className = '' } = props

  return (
    <Button
      icon={<MagnifyingGlassIcon size={SIZE_ICON} />}
      type='primary'
      {...props}
      className={className}
    >
      {label ? trans(label) : trans('buttons.search')}
    </Button>
  )
}

export default ButtonSearch
