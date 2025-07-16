import { SIZE_ICON } from '@constants/appConstant'
import { useAppSelector } from '@hooks/hook'
import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { Button, ButtonProps } from 'antd'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

interface ButtonSearchProps extends ButtonProps {
  label?: string
}

const ButtonSearch = (props: ButtonSearchProps) => {
  const { t: trans } = useTranslation()
  const { permissions } = useAppSelector((state) => state.auth.profile)

  const { label } = props

  /**
   * function get view permission
   */
  const isHasPermission = useCallback((): boolean => {
    return false
  }, [permissions])

  return (
    <Button
      icon={<MagnifyingGlassIcon size={SIZE_ICON} />}
      hidden={isHasPermission()}
      type='primary'
      {...props}
    >
      {label ? trans(label) : trans('buttons.search')}
    </Button>
  )
}

export default ButtonSearch
