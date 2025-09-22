import SearchBar from '@components/search-bar/SearchBar'
import {
    Form,
    Select,
    DatePicker,
    Button,
    Input
} from 'antd'
import { useTranslation } from 'react-i18next'
import ButtonSearch from '@components/button-search/ButtonSearch'
import { useEffect, useState } from 'react'
import { VatFeeApplicationType } from '@type/vat-fee'

const { RangePicker } = DatePicker

interface VatFeeManagementSearchBarProps {
  onFinish: (value: any) => void
  form: any
  onClearFilter?: () => void
  onCreateFee?: () => void
}

const VatFeeManagementSearchBar = ({ onFinish, form, onClearFilter, onCreateFee }: VatFeeManagementSearchBarProps) => {
  const { t } = useTranslation()
  const [applicationType, setApplicationType] = useState<string>('')

  const mockAccountGroups = [
    { value: 'group_1', label: 'Nhóm tài khoản 1' },
    { value: 'group_2', label: 'Nhóm tài khoản 2' },
    { value: 'group_3', label: 'Nhóm tài khoản 3' },
    { value: 'group_retail', label: 'Nhóm bán lẻ' },
    { value: 'group_wholesale', label: 'Nhóm bán sỉ' }
  ]

  useEffect(() => {
    form.setFieldsValue({
      applicationType: '',
      status: ''
    })
  }, [form])

  const handleApplicationTypeChange = (value: string) => {
    setApplicationType(value)
    // Clear dependent fields when application type changes
    form.setFieldsValue({
      accountGroup: undefined,
      accountNumber: undefined
    })
  }

  return (
    <SearchBar
      onFinish={onFinish}
      form={form}
      cols='3'
      isShowClearFilter={false}
      headerMenu={
        <>
          {/* Hàng 1 (3 cột) */}
          <Form.Item
            name='createdTime'
            label="Thời gian tạo"
          >
            <RangePicker
              className='w-full'
              size="large"
              format="DD/MM/YYYY HH:mm:ss"
              showTime
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          </Form.Item>

          <Form.Item
            name='appliedTime'
            label="Thời gian áp dụng"
          >
            <RangePicker
              className='w-full'
              size="large"
              format="DD/MM/YYYY HH:mm:ss"
              showTime
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          </Form.Item>

          <Form.Item
            name='status'
            label="Trạng thái"
          >
            <Select
              placeholder="Chọn trạng thái"
              size="large"
              defaultValue=""
              options={[
                { value: '', label: 'Tất cả' },
                { value: true, label: 'Đang hoạt động' },
                { value: false, label: 'Không hoạt động' }
              ]}
            />
          </Form.Item>

          {/* Hàng 2 (2 cột + conditional fields) */}
          <Form.Item
            name='applicationType'
            label="Đối tượng áp dụng*"
          >
            <Select
              placeholder="Chọn đối tượng áp dụng"
              size="large"
              defaultValue=""
              onChange={handleApplicationTypeChange}
              options={[
                { value: '', label: 'Tất cả' },
                { value: VatFeeApplicationType.SYSTEM, label: 'Hệ thống' },
                { value: VatFeeApplicationType.ACCOUNT_GROUP, label: 'Nhóm tài khoản' },
                { value: VatFeeApplicationType.INDIVIDUAL, label: 'Đối tượng riêng' }
              ]}
            />
          </Form.Item>

          {/* Conditional field based on application type */}
          {applicationType === VatFeeApplicationType.ACCOUNT_GROUP ? (
            <Form.Item
              name='accountGroup'
              label="Nhóm tài khoản*"
            >
              <Select
                placeholder="Chọn nhóm tài khoản"
                size="large"
                mode="multiple"
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={mockAccountGroups}
              />
            </Form.Item>
          ) : applicationType === VatFeeApplicationType.INDIVIDUAL ? (
            <Form.Item
              name='accountNumber'
              label="SĐT/Mã tài khoản"
            >
              <Input
                placeholder="Nhập SĐT hoặc mã tài khoản"
                size="large"
                allowClear
              />
            </Form.Item>
          ) : (
            <div></div>
          )}

          <div></div>

          {/* Row 3: Action buttons */}
          <div className='flex gap-2 items-center'>
            <Button
              type='default'
              className='flex-1'
              size="large"
              onClick={onClearFilter}
            >
              Bỏ lọc
            </Button>
          </div>

          <div className='flex gap-2 items-center'>
            <ButtonSearch
              htmlType='submit'
              className='w-full'
              size="large"
            >
              Tìm kiếm
            </ButtonSearch>
          </div>

          <div className='flex gap-2 items-center'>
            <Button
              type='primary'
              className='flex-1'
              size="large"
              onClick={onCreateFee}
            >
              Tạo cấu hình phí VAT
            </Button>
          </div>
        </>
      }
    />
  )
}

export default VatFeeManagementSearchBar