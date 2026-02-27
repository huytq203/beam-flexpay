import { DeleteOutlined, EditOutlined } from "@ant-design/icons"
import { ButtonComponent, CardComponent, Table } from "@components/index"
import { useGetFeeComponentTierQuery } from "@services/apiFeeComponentTier"
import { baseOn, beneficiaryType, calculationMethodEnum, componentType, feePolicyComponent, payerType } from "@pages/fee-managerment-v3/constants/feePoliciesComponent"

interface propComponentDetail {
  setOpenModalDetail: (value: boolean) => void
  data: feePolicyComponent
  onEdit?: (data: feePolicyComponent) => void
  onDelete?: (data: feePolicyComponent) => void
  selectedId?: string
}

export const ComponentDetail = ({ setOpenModalDetail, data, onEdit, onDelete, selectedId }: propComponentDetail) => {
  const { data: tierData } = useGetFeeComponentTierQuery(data.id)


  const columns = (data: feePolicyComponent) => {
    if (data.calculationMethod === 'DIRECT') {
      return [
        {
          title: 'Phí cố định',
          dataIndex: 'fixedAmount',
          className: 'border border-b-0'
        },
        {
          title: 'Phần trăm',
          dataIndex: 'percentage',
          className: 'border border-b-0 border-l-0'
        },
        {
          title: 'Giá trị tối thiểu',
          dataIndex: 'minFee',
          className: 'border border-b-0 border-l-0'
        },
        {
          title: 'Giá trị tối đa',
          dataIndex: 'maxFee',
          className: 'border border-b-0 border-l-0'
        }
      ]
    }
    else {
      return [
        {
          title: 'Phí cố định',
          dataIndex: 'fixedAmount',
          className: 'border border-b-0'
        },
        {
          title: 'Phần trăm',
          dataIndex: 'percentage',
          className: 'border border-b-0 border-l-0'
        },
        {
          title: 'Giá trị từ',
          dataIndex: 'minFee',
          className: 'border border-b-0 border-l-0'
        },
        {
          title: 'Giá trị đến',
          dataIndex: 'maxFee',
          className: 'border border-b-0 border-l-0'
        },
        {
          title: 'Giá trị min',
          dataIndex: 'minValue',
          className: 'border border-b-0 border-l-0'
        },
        {
          title: 'Giá trị max',
          dataIndex: 'maxValue',
          className: 'border border-b-0 border-l-0'
        }
      ]
    }
  }
  return (
    <>

      <div className="mb-3">
        <CardComponent
          bodyBackground="#f5f5f5"
          content={
            <div className=''>
              <div className='flex justify-between items-center mb-2'>
                <p className='font-medium'>{componentType[data.componentType as keyof typeof componentType]}</p>
                <div className=' flex gap-2 justify-center items-center'>
                  {!selectedId && <>
                    <ButtonComponent
                      size="small"
                      type='default'
                      content='Sửa '
                      onClick={() => {
                        onEdit?.(data)
                        setOpenModalDetail(true)
                      }}
                      icon={<EditOutlined />}
                    />
                    <ButtonComponent
                      size="small"
                      type='default'
                      content='Xóa '
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        onDelete?.(data)
                      }}
                    />
                  </>
                  }
                </div>
              </div>
              <div className=' flex gap-4 px-2 mb-3'>
                <span className='border px-2 py-1 rounded bg-gray-200 '>
                  Người trả: <span className='font-medium'>{payerType[data.payerType as keyof typeof payerType]}</span>
                </span>
                <span className='border px-2 py-1 rounded bg-gray-200'>
                  Người hưởng: <span className='font-medium'>{beneficiaryType[data.beneficiaryType as keyof typeof beneficiaryType]}</span>
                </span>
                <span className='border px-2 py-1 rounded bg-gray-200'>
                  Cách tính: <span className='font-medium'>{calculationMethodEnum[data.calculationMethod as keyof typeof calculationMethodEnum]} </span>
                </span>
                <span className='border px-2 py-1 rounded bg-gray-200'>
                  Dựa trên: <span className='font-medium'>{baseOn[data.componentType as keyof typeof baseOn]}</span>
                </span>
              </div>
              <div className='px-2'>
                {data.componentType === 'VAT' ? (
                  <span className='border px-2 py-1 rounded bg-gray-200'>
                    Phần trăm VAT: <span className='font-medium'>{data.percentage}%</span>
                  </span>
                ) : (
                  <Table
                    size='small'
                    rowKey='id'
                    dataSource={(data.calculationMethod === 'DIRECT' ? [data] : tierData) || []}
                    columns={columns(data)}
                    pagination={false}
                  />
                )}
              </div>
            </div>
          } />
      </div>
    </>
  )
}
