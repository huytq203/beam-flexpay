import React from 'react'
import { Table, Empty } from 'antd';
import type { TableProps } from 'antd';

const TableComponent = <T extends object>(props: TableProps<T>) => {
    return (
        <Table<T> {...props} locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='Chưa có dữ liệu' />, ...props.locale }} bordered scroll={{x:'max-content'}}/>
    )
}

export default TableComponent