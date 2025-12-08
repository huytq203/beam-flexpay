import React, { useState } from 'react'
import { Card, Table, Button } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { SelectInput, InputNumber } from '@components/common'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'

interface FeeTier {
  key: React.Key
  min: number | null
  max: number | null
  fixedFee: number | null
  percentFee: number | null
}

const FormAddFee = () => {
  const [data, setData] = useState<FeeTier[]>([
    {
      key: '1',
      min: null,
      max: null,
      fixedFee: null,
      percentFee: null,
    },
  ])
  const [typeCalculationFee, setTypealculationFee] = useState<number>(1)
  const handleAdd = () => {
    const newData: FeeTier = {
      key: Date.now().toString(), // Simple key generation
      min: null,
      max: null,
      fixedFee: null,
      percentFee: null,
    }
    setData([...data, newData])
  }

  const handleDelete = (key: React.Key) => {
    if (data.length > 1) {
      setData(data.filter((item) => item.key !== key))
    }
  }

  const handleChange = (
    key: React.Key,
    field: keyof FeeTier,
    value: number | null
  ) => {
    const newData = data.map((item) => {
      if (item.key === key) {
        return { ...item, [field]: value }
      }
      return item
    })
    setData(newData)
  }

  const columns: ColumnsType<FeeTier> = [
    {
      title: 'Từ (Min Value)',
      dataIndex: 'min',
      key: 'min',
      render: (text, record) => (
        <InputNumber
          placeholder="Min"
          value={text}
          onChange={(val) => handleChange(record.key, 'min', Number(val))}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Đến (Max Value)',
      dataIndex: 'max',
      key: 'max',
      render: (text, record) => (
        <InputNumber
          placeholder="Max"
          value={text}
          onChange={(val) => handleChange(record.key, 'max', Number(val))}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Phí Cố định',
      dataIndex: 'fixedFee',
      key: 'fixedFee',
      render: (text, record) => (
        <InputNumber
          placeholder="0"
          value={text}
          onChange={(val) => handleChange(record.key, 'fixedFee', Number(val))}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Phí %',
      dataIndex: 'percentFee',
      key: 'percentFee',
      render: (text, record) => (
        <InputNumber
          placeholder="0"
          value={text}
          onChange={(val) => handleChange(record.key, 'percentFee', Number(val))}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Xóa',
      key: 'action',
      width: 60,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.key)}
          disabled={data.length === 1}
        />
      ),
    },
  ]

  return (
    <div className='overflow-auto'>
      <Card
        className='mb-3'
        style={{ width: '100%' }}
      >
        <p className='font-bold mb-1'>Thông tin chung</p>
        <div className='grid grid-cols-12 gap-3 px-2'>
          <div className='col-span-4 flex flex-col'>
            <label
              className='font-normal mb-1'
              htmlFor=''
            >
              Loại phí
            </label>
            <SelectInput />
          </div>
          <div className='col-span-4 flex flex-col'>
            <label
              className='font-normal mb-1'
              htmlFor=''
            >
              Tính dựa trên
            </label>
            <SelectInput />
          </div>
          <div className='col-span-4 flex flex-col'>
            <label
              className='font-normal mb-1'
              htmlFor=''
            >
              Người chịu
            </label>
            <SelectInput />
          </div>
          <div className='col-span-4 flex flex-col'>
            <label
              className='font-normal mb-1'
              htmlFor=''
            >
              Người hưởng
            </label>
            <SelectInput />
          </div>

          <div className='col-span-4 flex flex-col'>
            <label
              className='font-normal mb-1'
              htmlFor=''
            >
              Công thức làm tròn
            </label>
            <SelectInput />
          </div>
          <div className='col-span-4 flex flex-col'>
            <label
              className='font-normal mb-1'
              htmlFor=''
            >
              Công thức tính phí
            </label>
            <SelectInput />
          </div>
        </div>
      </Card>

      <Card
        className='mb-3'
        style={{ width: '100%' }}
      >
        <p className='font-bold mb-3'>Phương thức tính (Calculation Method)</p>
        <div className="mb-3">
          <SelectInput 
          defaultValue={typeCalculationFee}
          data={[
            { label: "Bậc lúy tiến", value: 2 },
            { label: "Cố định", value: 1},
            { label: "Bậc thanh toàn phần", value:3 },
          ]} handleChange={(value) => setTypealculationFee(value)} />
        </div>

        {(typeCalculationFee == 2 || typeCalculationFee == 3) ? (
          <>
            <Table
              columns={columns}
              dataSource={data}
              pagination={false}
              bordered
              size="small"
            />
            <Button
              type="dashed"
              onClick={handleAdd}
              style={{ width: '100%', marginTop: 16 }}
              icon={<PlusOutlined />}
            >
              Thêm khoảng phí (Add Tier)
            </Button>
          </>):
          (
            <Card>
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-3 flex flex-col gap-2">
                  <label className='font-medium' htmlFor="">Phí cố định (Fixed)</label>
                  <InputNumber defaultValue={0}/>
                </div>
                <div className="col-span-3 flex flex-col gap-2">
                  <label className='font-medium' htmlFor="">Phí phần trăm (%)</label>
                  <InputNumber defaultValue={0}/>
                </div>
                <div className="col-span-3 flex flex-col gap-2">
                  <label className='font-medium' htmlFor="">Tối thiểu (Min)</label>
                  <InputNumber defaultValue={0}/>
                </div>
                <div className="col-span-3 flex flex-col gap-2">
                  <label className='font-medium' htmlFor="">Tối đa (Max)</label>
                  <InputNumber defaultValue={0}/>
                </div>
              </div>
            </Card>
          )
          }
    
      </Card>

    </div>
  )
}

export default FormAddFee
