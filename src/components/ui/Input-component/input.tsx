import { Input } from 'antd';
import React from 'react'
interface prop{
    lable?:string,
    placeholder?:string,
    defaultValue?:number
  
}

const input = ({placeholder,defaultValue}:prop) => {
    return (
            <Input placeholder={placeholder} defaultValue={defaultValue}/>
    )
}

export default input