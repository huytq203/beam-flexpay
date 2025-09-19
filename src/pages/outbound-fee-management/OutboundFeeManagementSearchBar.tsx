import SearchBar from '@components/search-bar/SearchBar'
import {
    Form,
    Select,
    DatePicker,
    Button
} from 'antd'
import { useTranslation } from 'react-i18next'
import ButtonSearch from '@components/button-search/ButtonSearch'
import { useEffect } from 'react'

const { RangePicker } = DatePicker

interface OutboundFeeManagementSearchBarProps {
  onFinish: (value: any) => void
  form: any
  onClearFilter?: () => void
  onCreateFee?: () => void
}

const OutboundFeeManagementSearchBar = ({ onFinish, form, onClearFilter, onCreateFee }: OutboundFeeManagementSearchBarProps) => {
  const { t } = useTranslation()

  useEffect(() => {
    form.setFieldsValue({
      method: 'all',
      provider: 'all',
    })
  }, [form])

  return (
    <SearchBar
      onFinish={onFinish}
      form={form}
      cols='4'
      isShowClearFilter={false}
      headerMenu={
        <>
          <Form.Item
            name='creationTime'
            label={t('labels.creationTime')}
          >
            <RangePicker className='w-full' size="large" />
          </Form.Item>

          <Form.Item
            name='applicableTime'
            label={t('labels.applicableTime')}
          >
            <RangePicker className='w-full' size="large" />
          </Form.Item>

          <Form.Item
            name='status'
            label={t('labels.status')}
          >
            <Select
              placeholder={t('placeholders.status')}
              size="large"
              options={[
                {
                  value: '',
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
            name='feeInside'
            label={t('labels.feeInside')}
          >
            <Select
              placeholder={t('placeholders.feeInside')}
              size="large"
              options={[
                {
                  value: '',
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
            name='method'
            label={t('labels.method')}
            rules={[{ required: true, message: t('messages.pleaseSelectMethod').toString() }]}
          >
            <Select
              placeholder={t('placeholders.method')}
              defaultValue="all"
              size="large"
              options={[
                { value: 'all', label: t('labels.all') },
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
            name='provider'
            label={t('labels.provider')}
            rules={[{ required: true, message: t('messages.pleaseSelectProvider').toString() }]}
          >
            <Select
              placeholder={t('placeholders.provider')}
              defaultValue="all"
              size="large"
              options={[
                { value: 'all', label: t('labels.all') },
                { value: 'vietqr', label: 'VietQR' },
                { value: 'napas', label: 'NAPAS' }
              ]}
            />
          </Form.Item>

          <Form.Item
            name='applicableTarget'
            label={t('labels.applicableTarget')}
          >
            <Select
              placeholder={t('placeholders.applicableTarget')}
              size="large"
              defaultValue=""
              options={[
                { value: '', label: t('labels.all') },
                { value: 'system', label: t('labels.system') },
                { value: 'account_group', label: t('labels.accountGroup') },
                { value: 'individual', label: t('labels.individual') }
              ]}
            />
          </Form.Item>

          <Form.Item
            name='transactionType'
            label={t('labels.transactionType')}
          >
            <Select
              placeholder={t('placeholders.transactionType')}
              defaultValue=""
              size="large"
              options={[
                { value: '', label: t('labels.all') },
                { value: 'deposit', label: t('labels.deposit') },
                { value: 'withdrawal', label: t('labels.withdrawal') },
                { value: 'payment', label: t('labels.payment') },
                { value: 'transfer', label: t('labels.transfer') },
                { value: 'refund', label: t('labels.refund') }
              ]}
            />
          </Form.Item>

          <Form.Item
            name='bank'
            label={t('labels.bank')}
          >
            <Select
              placeholder={t('placeholders.bank')}
              size="large"
              options={[
                {
                  value: 'bank_1',
                  label: "VP Bank"
                },
                {
                  value: 'bank_2',
                  label: "Vietcombank"
                }
              ]}
            />
          </Form.Item>

          {/* Row 3 */}
          <Form.Item
            name='accountGroup'
            label={t('labels.accountGroup')}
          >
            <Select
              placeholder={t('placeholders.accountGroup')}
              size="large"
              options={[
                {
                  value: 'group_1',
                  label: t('labels.group1')
                },
                {
                  value: 'group_2',
                  label: t('labels.group2')
                }
              ]}
            />
          </Form.Item>



          <div></div>
          <div></div>

          {/* Row 4 */}
          <div className='flex gap-2 items-center'>
            <Button
              type='default'
              className='flex-1'
              size="large"
              onClick={onClearFilter}
            >
              {t('buttons.clearFilter')}
            </Button>
          </div>

          <div className='flex gap-2 items-center'>
            <ButtonSearch
              htmlType='submit'
              className='w-full'
              size="large"
            >
              {t('buttons.search')}
            </ButtonSearch>
          </div>

          <div className='flex gap-2 items-center'>
            <Button
              type='primary'
              className='flex-1'
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