import { Input as AntdInput } from 'antd'
import { InputProps } from 'antd'
import type { InputRef } from 'antd'
import React from 'react'

interface Props extends InputProps {
  label?: string
}

const InputComponent = React.forwardRef<InputRef, Props>(
  ({ placeholder, value, onChange, ...rest }, ref) => {
    return (
      <AntdInput
        {...rest}
        ref={ref}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    )
  }
) as typeof AntdInput

// Explicitly attach the Password subcomponent (and other subcomponents)
InputComponent.Password = AntdInput.Password
InputComponent.TextArea = AntdInput.TextArea
InputComponent.Search = AntdInput.Search
InputComponent.Group = AntdInput.Group

export default InputComponent
