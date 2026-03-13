import { RadioComponent } from '@components/ui/radio-component'
import { getEnumLabel } from '@pages/fee-management-v3/utils/FeeManagement.utils'
import { serviceType } from '@pages/fee-management-v3/constants/feeAssignment'
import { ColumnType } from 'antd/es/table'
interface FormChoosePolicyColumnProps
{
    selectedId:string
    setSelectedId?:(value:string)=>void
    onSelect?:(value:string)=>void
    
}
const FormChoosePolicyColumn = ({ selectedId, setSelectedId, onSelect }:FormChoosePolicyColumnProps):ColumnType[] => [
    {
        title: 'STT',
        dataIndex: 'no',
        width: 60,
        align: 'center',
        
    },
    {
        title: 'Tên chính sách',
        dataIndex: 'name',
        
    },
    {
        title: 'Loại dịch vụ',
        dataIndex: 'serviceType',
        
        render: (value: string) => getEnumLabel(value, serviceType)
    },
    {
        title: 'Chọn',
        dataIndex: 'check',
        align: 'center',
        
        render: (_, record) => (
            <RadioComponent
                checked={selectedId === record.key}
                onChange={() => {
                    setSelectedId?.(record.key as string)
                    onSelect?.(record.key as string)
                }}
            />
        )
    }
]

export default FormChoosePolicyColumn