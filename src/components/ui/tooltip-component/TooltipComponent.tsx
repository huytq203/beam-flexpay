import { Tooltip, TooltipProps } from 'antd'
import React, { ReactNode } from 'react'
export type Props = TooltipProps & {
  children: ReactNode
}

const TooltipComponent = ({ children, ...tooltipProps }: Props) => {
  return <Tooltip  {...tooltipProps}>{children}</Tooltip>
}

export default TooltipComponent
