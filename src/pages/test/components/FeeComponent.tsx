import React from 'react'
import { Table } from 'antd'
import { ColumnType } from 'antd/es/table'
interface dataSource {
  key?: string | number
  from?: string
  to?: string
  formula?: string
  minMax?: string
}
interface columns extends ColumnType<dataSource> {
  title?: string
  dataIndex?: string
  key?: string
  className?: string
  onHeaderCell?: (column?: any) => {
    className?: string
    style?: React.CSSProperties
  }
}
interface FeeComponentProps {
  dataSource?: dataSource[]
  columns?: columns[]
}
const FeeComponent = ({ dataSource, columns }: FeeComponentProps) => {
  return (
    <div>
        <div className='cardItem1 p-3 rounded-lg border hover:border-l-blue-600 transition-all'>
          <div className='flex'>
            {/* <span className='bg-indigo-100 text-indigo-700 w-10 h-10 rounded-lg flex items-center justify-center mr-4 font-bold'>1</span> */}
            <div className='flex-1'>
              <div className='flex justify-between items-center'>
                <p className=' font-semibold'>Phí dịch vụ (MERCHANT_FEE) </p>
                <div className='flex justify-center items-center gap-3'>
                  <button className='border p-1 rounded-lg  hover:bg-gray-50'>
                    <svg
                      width={20}
                      height={20}
                    >
                      <use href='/icons.svg#hugeicons-edit-03' />
                    </svg>
                  </button>
                  <button className='border p-1 rounded-lg '>
                    <svg
                      width={20}
                      height={20}
                    >
                      <use href='/icons.svg#hugeicons-delete-02' />
                    </svg>
                  </button>
                </div>
              </div>
              <div className='flex gap-2'>
                <span className='text-[0.75rem] py-1 px-2 border rounded-sm bg-gray-100'>
                  Người trả: <span className='font-bold'>MERCHANT</span>
                </span>
                <span className='text-[0.75rem] py-1 px-2 border rounded-sm bg-gray-100'>
                  Người hưởng: <span className='font-bold'>SYSTEM</span>
                </span>
                <span className='text-[0.75rem] py-1 px-2 border rounded-sm bg-yellow-50 text-yellow-700 border-yellow-200'>
                  Cách tính:{' '}
                  <span className='font-bold'>Lũy tiến (Progressive Tier)</span>
                </span>
              </div>
            </div>
          </div>
          <div className='mt-3'>
            <Table
              dataSource={dataSource}
              columns={columns}
              pagination={false}
              size='small'
              className='tier-table '
              rowClassName={() => 'text-gray-700'}
            />
          </div>
        </div>
    </div>
  )
}

export default FeeComponent
