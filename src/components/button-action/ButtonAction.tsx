import { SIZE_ICON } from '@constants/appConstant'
import { useAppSelector } from '@hooks/hook'
import { GitBranch, PencilSimple, Trash, Eye } from '@phosphor-icons/react'
import { Button, ButtonProps, Tooltip } from 'antd'
import { TFunction } from 'i18next'
import { useCallback } from 'react'

interface CustomButtonProps<T> extends Omit<ButtonProps, 'onClick'> {
  module: string
  label?: string
  trans: TFunction
  action: IconName | IconName[]
  record: T
  onClick: (action: IconName, record: T) => void
}

const iconMap = {
  delete: Trash,
  update: PencilSimple,
  permission: GitBranch,
  view: Eye
}
export type IconName = keyof typeof iconMap

const ButtonAction = <T,>(props: CustomButtonProps<T>) => {
  const { module, action, trans, onClick, record, ...rest } = props

  const { permissions } = useAppSelector((state) => state.auth.profile)

  /**
   * function get permission action
   */
  const isHasPermission = useCallback((): boolean => {
    const moduleCreate = module + ':update'
    if (permissions.includes('admin*') || permissions.includes(moduleCreate))
      return true
    else return false
  }, [permissions])

  const namesArray = Array.isArray(action) ? action : [action]

  return !isHasPermission() ? null : (
    <div className='flex'>
      {namesArray.map((name) => {
        const IconComponent = iconMap[name]
        return (
          <Tooltip
            placement='top'
            title={trans(`admin-management.tooltip.${name}`)}
            key={name}
          >
            <Button
              className='ml-2'
              icon={<IconComponent size={SIZE_ICON} />}
              {...rest}
              onClick={() => onClick(name, record)}
            />
          </Tooltip>
        )
      })}
    </div>
  )
}

export default ButtonAction
