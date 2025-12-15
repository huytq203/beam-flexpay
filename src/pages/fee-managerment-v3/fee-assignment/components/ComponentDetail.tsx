import { DeleteOutlined, EditOutlined } from "@ant-design/icons"
import { ButtonComponent, CardComponent, Table } from "@components/common"
import { useGetFeeComponentTierQuery } from "@services/apiFeeComponentTier"
import { feePolicyComponent } from "@type/feePoliciesComponent"

interface propComponentDetail {
  setOpenModalDetail: (value: boolean) => void
  data: feePolicyComponent
  onEdit?: (data: feePolicyComponent) => void
  onDelete?:(data:feePolicyComponent)=>void
}

export const ComponentDetail = ({ setOpenModalDetail, data, onEdit ,onDelete}: propComponentDetail) => {
  // Fetch tier data using component id
  const { data: tierData } = useGetFeeComponentTierQuery(data.id)
  return (
    <>

      <div className="mb-3">
        <CardComponent
          bodyBackground="#f5f5f5"
          content={
            <div className=''>
              <div className='flex justify-between items-center mt-2'>
                <p className='font-medium'>{data.componentType}</p>
                <div className=' flex gap-2 justify-center items-center'>
                  <ButtonComponent
                    type='default'
                    content='Sửa '
                    onClick={() => {
                      onEdit?.(data)
                      setOpenModalDetail(true)
                    }}
                    icon={<EditOutlined {...({} as any)} />}
                  />
                  <ButtonComponent
                    type='default'
                    content='Xóa '
                    danger
                    icon={<DeleteOutlined {...({} as any)} />}
                    onClick={()=>{
                        onDelete(data)
                    }}
                  />
                </div>
              </div>
              <div className=' flex gap-4 px-2 mb-3'>
                <span className='border px-2 py-1 rounded bg-gray-200 '>
                  Người trả: <span className='font-medium'>{data.payerType}</span>
                </span>
                <span className='border px-2 py-1 rounded bg-gray-200'>
                  Người hưởng: <span className='font-medium'>{data.beneficiaryType}</span>
                </span>
                <span className='border px-2 py-1 rounded bg-gray-200'>
                  Cách tính: <span className='font-medium'>{data.calculationMethod}</span>
                </span>
                <span className='border px-2 py-1 rounded bg-gray-200'>
                  Dựa trên: <span className='font-medium'>{data.baseOn}</span>
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
                    dataSource={tierData || []}
                    columns={[
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
                    ]}
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
