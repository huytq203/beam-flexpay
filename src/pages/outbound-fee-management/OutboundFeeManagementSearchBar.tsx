import SearchBar from '@components/search-bar/SearchBar'
import { Button, DatePicker, Form, Select } from 'antd'
import { useTranslation } from 'react-i18next'
import ButtonSearch from '@components/button-search/ButtonSearch'
import { useEffect, useMemo, useState } from 'react'
import {
  useOutboundFeeCustomerSearchQuery,
  useOutboundFeeGetAccountGroupsListQuery,
  useOutboundFeeGetBanksListQuery
} from '@services/outboundFeeService'
import debounce from 'lodash/debounce'
import { Options } from '@constants/options'

const { RangePicker } = DatePicker

interface OutboundFeeManagementSearchBarProps {
  onFinish: (value: any) => void
  form: any
  onClearFilter?: () => void
  onCreateFee?: () => void
}

const OutboundFeeManagementSearchBar = ({
                                          onFinish,
                                          form,
                                          onClearFilter,
                                          onCreateFee
                                        }: OutboundFeeManagementSearchBarProps) => {
  const { t } = useTranslation()
  const [applicableTarget, setApplicableTarget] = useState('')
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')

  const { data: banksData } = useOutboundFeeGetBanksListQuery()
  const { data: accountGroupsData } = useOutboundFeeGetAccountGroupsListQuery()

  const { data: customersData, isFetching: isCustomersFetching } = useOutboundFeeCustomerSearchQuery({
    query: customerSearchQuery,
    page: 1,
    take: 10,
    order: 'DESC',
    orderBy: 'createdAt'
  }, {
    skip: applicableTarget !== 'individual'
  })

  // Debounced search function using lodash/debounce (same pattern as example)
  const debouncedSearch = useMemo(() => {
    const loadOptions = (value: string) => {
      // This will trigger the RTK Query
      setCustomerSearchQuery(value)
    }

    return debounce(loadOptions, 300)
  }, [])

  useEffect(() => {
    form.setFieldsValue({
      method: Options.ALL,
      provider: Options.ALL,
      applicableTarget: Options.ALL
    })
    setApplicableTarget(Options.ALL)
  }, [form])

  const handleApplicableTargetChange = (value: string) => {
    setApplicableTarget(value)
    setCustomerSearchQuery('')
    form.setFieldsValue({
      accountGroup: Options.ALL,
      phoneNumber: Options.ALL
    })
  }

  return (
    <SearchBar
      onFinish={onFinish}
      form={form}
      cols="4"
      isShowClearFilter={false}
      headerMenu={
        <>
          <Form.Item
            name="creationTime"
            label={t('labels.creationTime')}
          >
            <RangePicker
              className="w-full font-normal text-sm"
              showTime size="large"
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          </Form.Item>

          <Form.Item
            name="applicableTime"
            label={t('labels.applicableTime')}
          >
            <RangePicker
              className="w-full font-normal"
              showTime size="large"
              placeholder={['Từ ngày', 'Đến ngày']}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label={t('labels.status')}
          >
            <Select
              placeholder={t('placeholders.status')}
              size="large"
              defaultValue={Options.ALL}
              options={[
                {
                  value: Options.ALL,
                  label: t('labels.all')
                },
                {
                  value: 'new',
                  label: t('labels.newCreated')
                },
                {
                  value: 'applying',
                  label: t('labels.applying')
                }
              ]}
            />
          </Form.Item>

          <Form.Item
            name="feeInside"
            label={t('labels.feeInside')}
          >
            <Select
              placeholder={t('placeholders.feeInside')}
              size="large"
              defaultValue={Options.ALL}
              options={[
                {
                  value: Options.ALL,
                  label: t('labels.all')
                },
                {
                  value: 'inside',
                  label: t('labels.feeInside')
                },
                {
                  value: 'outside',
                  label: t('labels.feeOutside')
                }
              ]}
            />
          </Form.Item>

          {/* Row 2 */}
          <Form.Item
            name="applicableTarget"
            label={t('labels.applicableTarget')}
          >
            <Select
              placeholder={t('placeholders.applicableTarget')}
              size="large"
              defaultValue={Options.ALL}
              onChange={handleApplicableTargetChange}
              options={[
                { value: Options.ALL, label: t('labels.all') },
                { value: 'system', label: t('labels.system') },
                { value: 'account_group', label: t('labels.accountGroup') },
                { value: 'individual', label: t('labels.individual') }
              ]}
            />
          </Form.Item>

          <Form.Item
            name="transactionType"
            label={t('labels.transactionType')}
          >
            <Select
              placeholder={t('placeholders.transactionType')}
              defaultValue={Options.ALL}
              size="large"
              options={[
                { value: Options.ALL, label: t('labels.all') },
                { value: 'deposit', label: t('labels.deposit') },
                { value: 'withdrawal', label: t('labels.withdrawal') },
                { value: 'payment', label: t('labels.payment') },
                { value: 'transfer', label: t('labels.transfer') },
                { value: 'refund', label: t('labels.refund') }
              ]}
            />
          </Form.Item>

          <Form.Item
            name="bank"
            label={t('labels.bank')}
          >
            <Select
              placeholder={t('placeholders.bank')}
              size="large"
              defaultValue={Options.ALL}
              options={banksData ? [
                { value: Options.ALL, label: t('labels.all') },
                ...banksData.map((bank: { id: number; name: string; bankCode: string }) => ({
                  value: bank.id.toString(),
                  label: bank.name
                }))
              ] : [
                { value: Options.ALL, label: t('labels.all') }
              ]}
            />
          </Form.Item>

          <div></div>

          {/* Row 3 */}
          {applicableTarget === 'account_group' && (
            <Form.Item
              name="accountGroup"
              label={t('labels.accountGroup')}
            >
              <Select
                placeholder={t('placeholders.accountGroup')}
                size="large"
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={accountGroupsData ? accountGroupsData.map((group) => ({
                  value: group.id.toString(),
                  label: group.name
                })) : []}
              />
            </Form.Item>
          )}

          {applicableTarget === 'individual' && (
            <Form.Item
              name="phoneNumber"
              className="w-full font-normal text-sm"
              label={t('labels.phone')}
            >
              <Select
                placeholder={t('placeholders.phone')?.toString()}
                size="large"
                showSearch
                defaultActiveFirstOption={false}
                filterOption={false}
                onSearch={debouncedSearch}
                loading={isCustomersFetching}
                options={customersData?.data?.map((customer) => ({
                  value: customer.phoneNumber,
                  label: `${customer.fullName} - ${customer.phoneNumber}`
                })) || []}
                notFoundContent={isCustomersFetching ? 'Loading...' : 'No data'}
                allowClear
              />
            </Form.Item>
          )}

          <Form.Item
            name="method"
            label={t('labels.method')}
            rules={[{ required: true, message: t('messages.pleaseSelectMethod').toString() }]}
          >
            <Select
              placeholder={t('placeholders.method')}
              defaultValue={Options.ALL}
              size="large"
              options={[
                { value: Options.ALL, label: t('labels.all') },
                { value: 'atm_card', label: t('labels.atmCard') },
                { value: 'qr_code', label: t('labels.qrCode') },
                { value: 'bank_account', label: t('labels.bankAccount') },
                { value: 'ewallet', label: t('labels.ewallet') },
                { value: 'visa_international', label: t('labels.visaInternational') },
                { value: 'master_international', label: t('labels.masterInternational') },
                { value: 'jcb_international', label: t('labels.jcbInternational') },
                { value: 'amex_international', label: t('labels.amexInternational') }
              ]}
            />
          </Form.Item>

          <Form.Item
            name="provider"
            label={t('labels.provider')}
            rules={[{ required: true, message: t('messages.pleaseSelectProvider').toString() }]}
          >
            <Select
              placeholder={t('placeholders.provider')}
              defaultValue={Options.ALL}
              size="large"
              options={[
                { value: Options.ALL, label: t('labels.all') },
                { value: 'vietqr', label: 'VietQR' },
                { value: 'napas', label: 'NAPAS' }
              ]}
            />
          </Form.Item>


          <div></div>
          <div></div>

          {/* Row 4 */}
          <div className="flex gap-2 items-center">
            <Button
              type="default"
              className="flex-1"
              size="large"
              onClick={onClearFilter}
            >
              {t('buttons.clearFilter')}
            </Button>
          </div>

          <div className="flex gap-2 items-center">
            <ButtonSearch
              htmlType="submit"
              className="w-full"
              size="large"
            >
              {t('buttons.search')}
            </ButtonSearch>
          </div>

          <div className="flex gap-2 items-center">
            <Button
              type="primary"
              className="flex-1"
              size="large"
              onClick={onCreateFee}
            >
              {t('buttons.setupFee')}
            </Button>
          </div>

          <div></div>
        </>
      }
    />
  )
}

export default OutboundFeeManagementSearchBar