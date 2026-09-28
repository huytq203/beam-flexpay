import { Checkbox } from 'antd'
import type { CheckboxProps } from 'antd'

interface Props extends CheckboxProps {
  /** Kept for older callers; prefer children. */
  lable?: string
}

const CheckboxComponent = ({ lable, children, ...props }: Props) => (
  <Checkbox {...props}>{children ?? lable}</Checkbox>
)

export default CheckboxComponent
