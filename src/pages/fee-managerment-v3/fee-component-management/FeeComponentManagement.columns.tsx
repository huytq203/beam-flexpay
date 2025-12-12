import { DeleteOutlined, EditOutlined } from "@ant-design/icons"
import { ButtonComponent } from "@components/common"
import { Tooltip } from "antd"
import { getCalculationMethodLabel, getComponentTypeLabel } from "../FeeManagement.utils"
import { feePolicyComponent } from "@type/feePoliciesComponent"
import { ColumnsType } from "antd/es/table"

interface FeeComponentColumnsProps {
    setSelectedRow: (row: feePolicyComponent) => void;
    setOpen: (open: boolean) => void;
    setUpdateComponentId: (id: string) => void;
    setDeletingId: (id: string) => void;
    setOpenDialog: (open: boolean) => void;
}

export const feeComponentColumns = ({
    setSelectedRow,
    setOpen,
    setUpdateComponentId,
    setDeletingId,
    setOpenDialog
}: FeeComponentColumnsProps): ColumnsType<feePolicyComponent> => {
    return [
        {
            title: '#',
            dataIndex: 'no',
            width: 60,
            align: 'center' as const,
            className: 'border border-b-0',
            render: (_: any, __: any, index: number) => index + 1 // Assuming 'no' might not be in the data record itself or we can just use index
        },
        {
            title: 'Loại (Type)',
            dataIndex: 'componentType',
            key: 'componentType',
            className: ' border border-l-0',
            render: (value: string | undefined) => getComponentTypeLabel(value || "")
        },
        {
            title: 'Cách tính',
            dataIndex: 'calculationMethod',
            key: 'calculationMethod',
            className: ' border border-l-0 border-b-0',
            render: (value: string | undefined) => getCalculationMethodLabel(value || "")
        },
        {
            title: 'Công thức',
            dataIndex: 'fixedAmount',
            key: 'fixedAmount',
            className: ' border border-l-0 border-b-0',
            render: (_: any, record: feePolicyComponent) => {
                if (record.calculationMethod === 'DIRECT') {
                    return `${record.percentage ?? 0}% + ${record.fixedAmount ?? 0}`
                }
                return _
            }
        },
        {
            title: 'Người trả',
            dataIndex: 'payerType',
            key: 'payerType',
            className: ' border border-l-0 border-b-0'
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: 50,
            className: 'border border-l-0 border-b-0',
            align: 'center' as const,
            render: (_: any, record: feePolicyComponent) => (
                <div className='flex gap-1 justify-center'>
                    <Tooltip title="Cập nhật">
                        <ButtonComponent
                            type='text'
                            icon={<EditOutlined {...({} as any)} />}
                            onClick={() => {
                                setSelectedRow(record)
                                setOpen(true)
                                setUpdateComponentId(record.id)
                            }}
                        />

                    </Tooltip>
                    <Tooltip title="Xóa">
                        <ButtonComponent
                            type="text"
                            danger
                            icon={<DeleteOutlined {...({} as any)} />}
                            onClick={() => {
                                setDeletingId(record.id)
                                setOpenDialog(true)
                            }}
                        />
                    </Tooltip>
                </div>
            )
        }
    ]
}
