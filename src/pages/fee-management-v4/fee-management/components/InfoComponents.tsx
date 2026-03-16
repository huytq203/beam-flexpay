import { PlusOutlined } from '@components/icons'
import { ButtonComponent, Table } from '@components/index'
import { Control, FieldArrayWithId } from 'react-hook-form'
import { ColumnsType } from 'antd/es/table'
import { FeeComponentType } from '@pages/fee-management-v4/fee-assignment/schemas/FeeManagement.schema'

interface InfoComponentsProps {
  control?: Control<FeeComponentType>
  columns?: ColumnsType<any>
  fields?: FieldArrayWithId<FeeComponentType, 'tiers'>[]
  append?: () => void
}

const InfoComponents: React.FC<InfoComponentsProps> = ({ columns, fields, append }) => {
  return (
    <div>
      <p className='font-bold mb-3'>Phương thức tính (Calculation Method)</p>
      <Table
        rowKey={'id'}
        size='small'
        columns={columns}
        dataSource={fields}
        pagination={false}
        bordered
      />
      <ButtonComponent
        content=' Thêm khoảng phí (Add Tier)'
        type='dashed'
        onClick={append}
        style={{ width: '100%', marginTop: 16 }}
        icon={<PlusOutlined />}
      />
    </div>
  )
}

export default InfoComponents

