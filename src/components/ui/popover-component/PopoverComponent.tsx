import { Popover, type PopoverProps } from 'antd'

const PopoverComponent = ({ children, ...popoverProps }: PopoverProps) => (
  <Popover {...popoverProps}>{children}</Popover>
)

export default PopoverComponent
