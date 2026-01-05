import { Tabs, TabsProps } from 'antd/lib';
import React from 'react';



interface props extends TabsProps {
    items: TabsProps['items']
    onChange?: (value: string) => void
    className?: string
    centered?: boolean
    activeKey?: string
}

const TabComponent: React.FC<props> = ({ items, onChange, className, centered = false, activeKey, ...rest }) => (
    <Tabs
        items={items}
        onChange={onChange}
        className={className}
        centered={centered}
        {...rest}
    />
);

export default TabComponent