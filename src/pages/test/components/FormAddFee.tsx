import React, { useState } from 'react'
import { Card } from 'antd'
import { Input, InputNumber, SelectInput, Switch } from '@components/common'
interface FeeInfoCardProps {
  onDelete: () => void
  feeCards?: number[]
}

const FeeInfoCard = ({ onDelete, feeCards }: FeeInfoCardProps) => {
  const [disabled, setDisabled] = useState({
    min: true,
    max: true
  })

  const toggle = (key: 'min' | 'max') => {
    setDisabled((prev) => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <Card
      className='mb-3'
      style={{ width: '100%' }}
    >
      <div className='flex justify-between items-center'>
        <p className='font-bold'>Thông tin phí</p>
        <button
          disabled={feeCards?.length === 1}
          className='border rounded-md p-1 hover:bg-gray-100 disabled:bg-gray-200'
          onClick={(e) => {
            e.preventDefault()

            onDelete()
          }}
        >
          <svg
            width={20}
            height={20}
          >
            <use href='/icons.svg#hugeicons-delete-02' />
          </svg>
        </button>
      </div>

      <div className='grid grid-cols-12 gap-3 px-2'>
        <div className='col-span-12 flex flex-col'>
          <label
            className='font-normal mb-1'
            htmlFor=''
          >
            Giá trị từ
          </label>
          <InputNumber defaultValue={0} />
        </div>
        <div className='col-span-12 flex flex-col'>
          <label
            className='font-normal mb-1'
            htmlFor=''
          >
            Đến
          </label>
          <InputNumber placeholder='50.000' />
        </div>
        <div className='col-span-12 flex flex-col'>
          <label
            className='font-normal mb-1'
            htmlFor=''
          >
            Phí %
          </label>
          <InputNumber placeholder='Nhập phí %' />
        </div>
        <div className='col-span-12 flex flex-col'>
          <label
            className='font-normal mb-1'
            htmlFor=''
          >
            Phí cố định
          </label>
          <InputNumber placeholder='Nhập phí cố định (VND)' />
        </div>
        <div className='col-span-12 flex flex-col'>
          <div className='flex justify-between items-center'>
            <label
              className='font-normal mb-1'
              htmlFor=''
            >
              Giá tối thiểu
            </label>
            <Switch onChange={() => toggle('min')} />
          </div>
          <InputNumber
            disabled={disabled.min}
            placeholder='Nhập phí tối thiểu (VND)'
          />
        </div>
        <div className='col-span-12 flex flex-col'>
          <div className='flex justify-between items-center'>
            <label
              className='font-normal mb-1'
              htmlFor=''
            >
              Giá tối đa
            </label>
            <Switch onChange={() => toggle('max')} />
          </div>
          <InputNumber
            disabled={disabled.max}
            placeholder='Nhập phí tối đa (VND)'
          />
        </div>
      </div>
    </Card>
  )
}

const FormAddFee = () => {
  const [feeCards, setFeeCards] = useState<number[]>([1])

  const handleAddFee = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setFeeCards((prev) => {
      const newId = prev.length > 0 ? Math.max(...prev) + 1 : 1
      return [...prev, newId]
    })
  }

  const handleDeleteFee = (id: number) => {
    if (feeCards.length === 1) return
    setFeeCards((prev) => prev.filter((cardId) => cardId !== id))
  }

  return (
    <div className='overflow-auto'>
      <Card
        className='mb-3'
        style={{ width: '100%' }}
      >
        <p className='font-bold mb-1'>Thông tin chung</p>
        <div className='grid grid-cols-12 gap-3 px-2'>
          <div className='col-span-12 flex flex-col'>
            <label
              className='font-normal mb-1'
              htmlFor=''
            >
              Loại phí
            </label>
            <SelectInput />
          </div>
          <div className='col-span-12 flex flex-col'>
            <label
              className='font-normal mb-1'
              htmlFor=''
            >
              Tính dựa trên
            </label>
            <SelectInput />
          </div>
          <div className='col-span-12 flex flex-col'>
            <label
              className='font-normal mb-1'
              htmlFor=''
            >
              Người chịu
            </label>
            <SelectInput />
          </div>
          <div className='col-span-12 flex flex-col'>
            <label
              className='font-normal mb-1'
              htmlFor=''
            >
              Người hưởng
            </label>
            <SelectInput />
          </div>
          <div className='col-span-12 flex flex-col'>
            <label
              className='font-normal mb-1'
              htmlFor=''
            >
              Công thức tính phí
            </label>
            <SelectInput />
          </div>
          <div className='col-span-12 flex flex-col'>
            <label
              className='font-normal mb-1'
              htmlFor=''
            >
              Công thức làm tròn
            </label>
            <SelectInput />
          </div>
        </div>
      </Card>

      {feeCards.map((id) => (
        <FeeInfoCard
          key={id}
          onDelete={() => handleDeleteFee(id)}
          feeCards={feeCards}
        />
      ))}

      <div className='flex justify-center items-center'>
        <button onClick={handleAddFee}>+ Thêm bậc phí</button>
      </div>
    </div>
  )
}

export default FormAddFee
