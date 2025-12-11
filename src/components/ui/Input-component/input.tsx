import { Input } from 'antd';
import React, { ChangeEvent } from 'react'
interface prop{
    lable?:string,
    placeholder?:string,
    defaultValue?:number|string,
    [key: string]: any;
}

const InputComponent = React.forwardRef(({placeholder,defaultValue, onchange, ...rest}:prop, ref: any) => {
    return (
            <Input  {...rest} ref={ref} placeholder={placeholder} defaultValue={defaultValue} />
                 
    )
})

export default InputComponent