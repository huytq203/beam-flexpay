import { Card } from 'antd'
import { CardProps } from 'antd/lib'
import React, { ReactNode } from 'react'
interface CardComponentProps extends Omit<CardProps, 'content'> {
    content?: ReactNode
}
const CardComponent = ({ content }: CardComponentProps) => {
    return (
        <Card>
            {content}
        </Card>
    )
}

export default CardComponent