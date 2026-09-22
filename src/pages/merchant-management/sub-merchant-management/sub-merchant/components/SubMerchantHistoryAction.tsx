import { Can } from '@/app/permissions'
import { ButtonComponent, TooltipComponent } from '@components/index'

const UNAVAILABLE_MESSAGE = 'Lịch sử giao dịch theo Sub-merchant chưa khả dụng.'

export function SubMerchantHistoryAction() {
  return (
    <Can action='view' screen='TRANSACTION_WALLET'>
      <TooltipComponent title={UNAVAILABLE_MESSAGE}>
        <span aria-label={UNAVAILABLE_MESSAGE} className='rounded-md focus-visible:outline-2 focus-visible:outline-primary' tabIndex={0}>
          <ButtonComponent className='w-full sm:w-auto' content='Lịch sử giao dịch' disabled htmlType='button' type='default' />
        </span>
      </TooltipComponent>
    </Can>
  )
}
