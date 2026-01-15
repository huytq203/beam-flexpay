import {  Dropdown, DropdownProps, MenuProps } from 'antd/lib'
import React from 'react'

interface props extends DropdownProps {
    content: React.ReactNode
    items?: MenuProps['items']
    placement?: "topLeft" | "topCenter" | "topRight" | "bottomLeft" | "bottomCenter" | "bottomRight" | "top" | "bottom" | undefined
}
const DropDownComponent = ({ content, items, placement }: props) => {
    return (
        <Dropdown menu={{ items }} placement={placement || 'bottomRight'} arrow>
            {content}
        </Dropdown>
    )
}
export default DropDownComponent