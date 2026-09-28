import { Select } from 'antd'
import type { SelectProps } from 'antd'

/** Typed select boundary for controlled single and multiple selections. */
export function SelectComponent<ValueType = string>(props: SelectProps<ValueType>) {
  return <Select<ValueType> {...props} />
}
