import React, { ReactNode } from 'react'
import { Button, ButtonProps } from 'antd'
interface props extends ButtonProps {
  onclick?:()=>void,
  content?: string,
  icon?: ReactNode,
  type?: "link" | "text" | "default" | "primary" | "dashed" | undefined
  color?: "default" | "primary" | "danger" | "blue" | "purple" | "cyan" | "green" | "magenta" | "pink" | "red" | "orange" | "yellow" | "volcano" | "geekblue" | "lime" | "gold" | undefined
  variant?: "link" | "text" | "dashed" | "outlined" | "solid" | "filled" | undefined
  form?: string,
  htmlType?: "button" | "submit" | "reset" | undefined
}
const ButtonComponent = ({ onClick, content, icon, type, variant, color, form, htmlType, ...rest }: props) => {
  return (
      <Button
        type={type ?? 'primary'}
        onClick={onClick}
        color={color}
        variant={variant}
        form={form}
        htmlType={htmlType}
        {...rest}
      >
        {icon}
        {content}
      </Button>
  )
}

export default ButtonComponent
