import { Input } from 'antd'
import { InputProps } from 'antd'
import React from 'react'

interface Props extends InputProps {
  label?: string
}

const InputComponent = React.forwardRef<HTMLInputElement, Props>(
  ({ placeholder, value, onChange, ...rest }, ref:any) => {
    return (
      <Input
        {...rest}
        ref={ref}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    )
  }
)

export default InputComponent
