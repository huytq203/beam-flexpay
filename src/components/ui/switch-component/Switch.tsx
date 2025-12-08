import React from 'react'
import { Switch } from 'antd';
import { SwitchProps } from 'antd/lib';
interface props extends SwitchProps{
    onChange?:()=>void
}
const SwitchComponent = ({onChange}:props) => {
  return (
    <div>
      <Switch size="default" defaultChecked onChange={onChange} />
    </div>
  )
}

export default SwitchComponent
