import { Timeline, TimelineProps } from 'antd'
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
                        <span className="font-medium mt-1">{item.title}</span>
                        {item.time && (
                            <span className="text-[12px] text-gray-500">
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