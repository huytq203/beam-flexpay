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
import { OUTBOUND_FEE_STATUS_OPTIONS } from '@constants/outbound-fee-status'

const { RangePicker } = DatePicker

interface OutboundFeeManagementSearchBarProps {
  onFinish: (value: any) => void
  form: any
  onClearFilter?: () => void
  onCreateFee?: () => void
}

const INITIAL_APPLICABLE_TARGET = ''

const OutboundFeeManagementSearchBar = ({
                                          onFinish,
                                          form,
                                          onClearFilter,
                                          onCreateFee
                                        }: OutboundFeeManagementSearchBarProps) => {
  const { t } = useTranslation()
  const [applicableTarget, setApplicableTarget] = useState(INITIAL_APPLICABLE_TARGET)
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
      applicationType: Options.ALL,
      transactionType: Options.ALL,
      bankIds: undefined,
      chargeWithin: Options.ALL,
      methods: undefined,
      providers: undefined,
      status: '' // Default to "Tất cả"
    })
    setApplicableTarget(INITIAL_APPLICABLE_TARGET)
  }, [form])

  const handleApplicableTargetChange = (value: string) => {
    setApplicableTarget(value)
    setCustomerSearchQuery('')
    form.setFieldsValue({
      accountGroupIds: undefined,
      customerId: undefined
    })
  }

  const handleClearFilterClick = () => {
    // Reset local states
    setApplicableTarget(INITIAL_APPLICABLE_TARGET)
    setCustomerSearchQuery('')

    // Call parent clear filter handler
    onClearFilter?.()
  }

  return (
    <SearchBar
      onFinish={onFinish}
      form={form}
      cols="3"
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
              placeholder="Chọn trạng thái"
              size="large"
              defaultValue=""
              options={OUTBOUND_FEE_STATUS_OPTIONS}
              allowClear
            />
          </Form.Item>

          {/* Row 2 */}
          <Form.Item
            name="applicationType"
            label={t('labels.applicableTarget')}
          >
            <Select
              placeholder={t('placeholders.applicableTarget')}
              size="large"
              defaultValue=""
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
            name="bankIds"
            label={t('labels.bank')}
          >
            <Select
              mode="multiple"
              placeholder={t('placeholders.bank')}
              size="large"
              maxTagCount={2}
              showSearch
              filterOption={(input, option) =>
                String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={banksData ? banksData.map((bank: { id: number; name: string; bankCode: string }) => ({
                value: bank.id,
                label: bank.name
              })) : []}
              allowClear
            />
          </Form.Item>

          {/* Row 3 */}
          <Form.Item
            name="chargeWithin"
            label={t('labels.chargeWithin')}
          >
            <Select
              placeholder="Chọn thu phí trong"
              size="large"
              defaultValue={Options.ALL}
              options={[
                { value: Options.ALL, label: t('labels.all') },
                { value: 'true', label: 'Có' },
                { value: 'false', label: 'Không' }
              ]}
            />
          </Form.Item>
          {applicableTarget === 'account_group' ? (
            <Form.Item
              name="accountGroupIds"
              label={t('labels.accountGroup')}
            >
              <Select
                mode="multiple"
                placeholder={t('placeholders.accountGroup')}
                size="large"
                maxTagCount={2}
                showSearch
                filterOption={(input, option) =>
                  String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={accountGroupsData ? accountGroupsData.map((group) => ({
                  value: group.id,
                  label: group.name
                })) : []}
                allowClear
              />
            </Form.Item>
          ) : applicableTarget === 'individual' ? (
            <Form.Item
              name="customerId"
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
                  value: customer.id,
                  label: `${customer.fullName} - ${customer.phoneNumber}`
                })) || []}
                notFoundContent={isCustomersFetching ? 'Loading...' : 'No data'}
                allowClear
              />
            </Form.Item>
          ) : (
            <div></div>
          )}

          <Form.Item
            name="methods"
            label={t('labels.method')}
          >
            <Select
              mode="multiple"
              placeholder={t('placeholders.method')}
              size="large"
              maxTagCount={2}
              showSearch
              filterOption={(input, option) =>
                String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={[
                { value: 'atm_card', label: t('labels.atmCard') },
                { value: 'qr_code', label: t('labels.qrCode') },
                { value: 'bank_account_ib', label: t('labels.bankAccountIb') },
                { value: 'atm_ibft', label: t('labels.atmCardIbft') },
                { value: 'bank_account_ibft', label: t('labels.bankAccountIbft') },
                { value: 'ewallet', label: t('labels.ewallet') },
                { value: 'bank_count', label: t('labels.bankAccount') },
                { value: 'visa_international', label: t('labels.visaInternational') },
                { value: 'master_international', label: t('labels.masterInternational') },
                { value: 'jcb_international', label: t('labels.jcbInternational') },
                { value: 'amex_international', label: t('labels.amexInternational') }
              ]}
              allowClear
            />
          </Form.Item>

          <Form.Item
            name="providers"
            label={t('labels.provider')}
          >
            <Select
              mode="multiple"
              placeholder={t('placeholders.provider')}
              size="large"
              maxTagCount={2}
              showSearch
              filterOption={(input, option) =>
                String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={[
                { value: 'vpbank', label: 'VPBank' },
                { value: 'napas', label: 'NAPAS' }
              ]}
              allowClear
            />
          </Form.Item>

          {/* Row 4 */}
          <div className="flex gap-2 items-center">
            <Button
              type="default"
              className="flex-1"
              size="large"
              onClick={handleClearFilterClick}
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
        </>
      }
    />
  )
}

export default OutboundFeeManagementSearchBar
