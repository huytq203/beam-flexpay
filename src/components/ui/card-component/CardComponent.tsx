import { cn } from '@/lib/utils/cn'
import { Card } from 'antd'
import { CardProps } from 'antd'
import React, { ReactNode } from 'react'
interface CardComponentProps extends Omit<CardProps, 'content'> {
  content?: ReactNode
  bodyBackground?: string
  children?: ReactNode
  className?: string
}
const CardComponent = ({children, content, bodyBackground: _bodyBackground, className, ...rest }: CardComponentProps) => {
  return (
    <Card
    className={cn('bg-white/90', className)}
      {...rest}
    >
     {content ?? children}
    </Card>
  )
}

export default CardComponent