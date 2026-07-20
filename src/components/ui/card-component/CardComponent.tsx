import { Card } from 'antd'
import { CardProps } from 'antd'
import React, { ReactNode } from 'react'
interface CardComponentProps extends Omit<CardProps, 'content'> {
  content?: ReactNode
  bodyBackground?: string
  children?: ReactNode
}
const CardComponent = ({children, content, bodyBackground: _bodyBackground, ...rest }: CardComponentProps) => {
  return (
    <Card
    className='bg-white/90'
      {...rest}
    >
     {content ?? children}
    </Card>
  )
}

export default CardComponent