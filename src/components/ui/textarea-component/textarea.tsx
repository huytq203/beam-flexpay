import React from 'react'
import { Input } from 'antd'

const { TextArea } = Input

interface Props {
  rows?: number
  placeholder?: string
}

const TextAreaComponent = React.forwardRef(({ ...rest }: Props, ref: any) => {
  return <TextArea ref={ref} {...rest} />
})

export default TextAreaComponent
