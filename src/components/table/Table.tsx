import { Table as AntTable, TableProps } from 'antd'

type props = TableProps<any> & {
  data?: any
}

function Table(props: props) {
  return (
    <AntTable
      columns={props.columns}
      dataSource={props.dataSource}
      scroll={{ x: '100%' }}
      rowKey='_id'
      size='small'
      bordered
      {...props}
    />
  )
}
export default Table
