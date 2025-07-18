import { SIZE_ICON } from '@constants/appConstant'
import { useAppSelector } from '@hooks/hook'
import { GitBranch, PencilSimple, Trash } from '@phosphor-icons/react'
import { Button, ButtonProps, Tooltip } from 'antd'
import { TFunction } from 'i18next'
import { useCallback } from 'react'

interface CustomButtonProps extends Omit<ButtonProps, 'onClick'> {
  module: string
  label?: string
  trans: TFunction
  action: IconName | IconName[]
  onClick: (action: IconName) => void
}

const iconMap = {
  delete: Trash,
  update: PencilSimple,
  permission: GitBranch
}
export type IconName = keyof typeof iconMap

const ButtonAction = (props: CustomButtonProps) => {
  const { module, action, trans, onClick, ...rest } = props

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
    <div>
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
              onClick={() => onClick(name)}
            />
          </Tooltip>
        )
      })}
    </div>
  )
}

export default ButtonAction
