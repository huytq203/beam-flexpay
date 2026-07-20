import React from 'react'
import { Input } from 'antd'
import type { TextAreaProps, TextAreaRef } from 'antd/es/input/TextArea'

const { TextArea } = Input

type Props = TextAreaProps

const TextAreaComponent = React.forwardRef<TextAreaRef, Props>(({ ...rest }, ref) => {
  return <TextArea ref={ref} {...rest} />
})

export default TextAreaComponent
