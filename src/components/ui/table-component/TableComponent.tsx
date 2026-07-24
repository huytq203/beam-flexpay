import React from 'react'
import { Empty, Table } from 'antd'
import type { TablePaginationConfig, TableProps } from 'antd'

const defaultPagination: TablePaginationConfig = {
  showSizeChanger: true,
  showTotal: (total, range) =>
    `Hiển thị ${range[0]}-${range[1]}/ ${total} Bản ghi`
}

const TableComponent = <T extends object>(props: TableProps<T>) => {
  const pagination =
    props.pagination === false
      ? false
      : {
          ...defaultPagination,
          ...props.pagination
        }

  return (
    <Table<T>
      {...props}
      bordered
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description='Chưa có dữ liệu'
          />
        ),
        ...props.locale
      }}
      pagination={pagination}
      scroll={{ x: 'max-content', ...props.scroll }}
    />
  )
}

export default TableComponent
