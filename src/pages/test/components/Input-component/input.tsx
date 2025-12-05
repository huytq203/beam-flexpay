import { Input } from 'antd';
import React from 'react'
interface prop{
    lable:string,
    placeholder:string,
    customCss:string
}

const input = ({lable,placeholder,customCss}:prop) => {
    return (
        <div className={customCss}>
            <label htmlFor="">{lable}</label>
            <Input placeholder={placeholder}/>
        </div>
    )
}

export default input