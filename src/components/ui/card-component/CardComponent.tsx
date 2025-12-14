import { Card } from 'antd'
import { CardProps } from 'antd/lib'
import React, { ReactNode } from 'react'
interface CardComponentProps extends Omit<CardProps, 'content'> {
    content?: ReactNode
    bodyBackground ?:string
}
const CardComponent = ({ content,bodyBackground, ...rest }: CardComponentProps) => {
    return (
        <Card
            bodyStyle={{
                backgroundColor: bodyBackground || '#ffffff',
                ...rest.bodyStyle // Merge với bodyStyle khác nếu có
            }}
            {...rest}
        >
            {content}
        </Card>
    )
}

export default CardComponent