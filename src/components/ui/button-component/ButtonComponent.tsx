import React, { ReactNode } from 'react'
import { Button,ButtonProps } from 'antd'
interface props extends ButtonProps{
    onclick?:()=>void,
    content?:string,
    icon?:ReactNode,
    type?:"link" | "text" | "default" | "primary" | "dashed" | undefined
    
}
const ButtonComponent = ({onclick,content,icon,type}:props) => {
  return (
    <div>
      <Button
        type={type??'primary'}
        onClick={onclick}
      >
        {icon}
       {content}
      </Button>
    </div>
  )
}

export default ButtonComponent
