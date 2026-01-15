import { Timeline, TimelineProps } from 'antd/lib'
import React from 'react'

interface TimelineItem {
    id?: string | number
    title: string
    time?: string
    color?: 'blue' | 'green' | 'red' | 'gray'
}

interface props extends TimelineProps {

    items: TimelineItem[]
}

const TimeLineComponent = ({ items }: props) => {
    return (
        <Timeline
            items={items.map((item) => ({
                color: item.color || 'blue',
                children: (
                    <div className="flex flex-col">
                        <span className="font-medium">{item.title}</span>
                        {item.time && (
                            <span className="text-xs text-gray-500">
                                {item.time}
                            </span>
                        )}
                    </div>
                ),
            }))}
        />
    )
}

export default TimeLineComponent