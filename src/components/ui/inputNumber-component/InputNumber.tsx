import React from 'react'
import type { InputNumberProps } from 'antd'
import { InputNumber } from 'antd'
import './style.scss'
interface Props extends InputNumberProps {
  defaultValue?: number
  placeholder?: string
  disabled?: boolean
}
const InputNumberComponent = ({
  defaultValue,
  placeholder,
  disabled,
  ...props
}: Props) => {
  return (
      <InputNumber
        style={{ width: '100%' }}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        {...props}
      />
  )
}

export default InputNumberComponent
