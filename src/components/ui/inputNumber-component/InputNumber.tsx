import React from 'react'
import type { InputNumberProps } from 'antd'
import { InputNumber } from 'antd'
interface Props extends InputNumberProps {
  defaultValue?: number
  placeholder?: string
  disabled?: boolean
}
const InputNumberComponent = ({
  defaultValue,
  placeholder,
  disabled
}: Props) => {
  return (
    <div>
      <InputNumber
        style={{ width: '100%' }}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  )
}

export default InputNumberComponent
