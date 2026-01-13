import React from 'react'
import { Table } from 'antd';
import type { TableProps } from 'antd';

const TableComponent = <T extends object>(props: TableProps<T>) => {
    return (
        <Table<T> {...props}  scroll={{x:'max-content'}}/>
    )
}

export default TableComponent