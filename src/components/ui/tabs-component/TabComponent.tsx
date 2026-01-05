import { Tabs, TabsProps } from 'antd/lib';
import React from 'react';



interface props extends TabsProps{
    items: TabsProps['items']
    onChange:()=>void
}

const TabComponent: React.FC<props> = ({items,onChange}) => <Tabs defaultActiveKey="1" items={items} onChange={onChange} />;

export default TabComponent