import { Checkbox } from 'antd'
import { CheckboxProps } from 'antd/lib'
import React from 'react'
interface props extends CheckboxProps{
    lable?:string
}
const CheckboxComponent = ({onChange,lable}:props) => {
  return (
    <Checkbox onChange={onChange}>{lable}</Checkbox>
  )
}

export default CheckboxComponent
