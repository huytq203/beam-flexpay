import React from 'react'
import { Input } from 'antd'

const { TextArea } = Input
interface TextAreaProps {
  rows?: number
  placeholder?:string
}
const textarea = ({ rows,placeholder }: TextAreaProps) => {
  return (
    <div>
      <>
        <TextArea rows={rows} placeholder={placeholder}/>
      </>
    </div>
  )
}

export default textarea
