import { useState } from 'react'
import {
  ButtonComponent,
  DialogModal,
  type PickedEntity
} from '@components/index'
import { usePaymentMethodEditor } from '../hooks/usePaymentMethodEditor'
import { PaymentMethodConfigBody } from './PaymentMethodConfigBody'
import { PaymentMethodScopeField } from './PaymentMethodScopeField'

interface PaymentMethodEditorProps {
  merchantId: string
  merchantName: string
  /** Mở thẳng cấp Sub (khi sửa dòng Sub trong danh sách). */
  initialSub?: PickedEntity
  onClose: () => void
}

export function PaymentMethodEditor({
  merchantId,
  merchantName,
  initialSub,
  onClose
}: PaymentMethodEditorProps) {
  const [level, setLevel] = useState<'MASTER' | 'SUB'>(
    initialSub ? 'SUB' : 'MASTER'
  )
  const [sub, setSub] = useState<PickedEntity | undefined>(initialSub)
  const subMerchantId = level === 'SUB' ? sub?.id : undefined
  const waitingForSub = level === 'SUB' && !sub
  const editor = usePaymentMethodEditor({
    masterId: merchantId,
    subMerchantId,
    skip: waitingForSub,
    onSaved: onClose
  })
  const { query, config } = editor
  const configured = config?.configured ?? false
  const actionLabel = configured ? 'Cập nhật' : 'Thiết lập'
  const scopeName = subMerchantId && sub ? sub.name : merchantName

  return (
    <DialogModal
      open
      title={`${actionLabel} hình thức thanh toán · ${scopeName}`}
      width={{ xs: 'calc(100vw - 24px)', md: 600 }}
      onCancel={onClose}
      onOk={() => void editor.save()}
      okButtonProps={{
        loading: editor.saving,
        disabled: waitingForSub || !config || query.isFetching
      }}
      okText={actionLabel}
    >
      <div className='space-y-4 pt-2'>
        <PaymentMethodScopeField
          masterId={merchantId}
          masterName={merchantName}
          level={level}
          sub={sub}
          disabled={editor.saving}
          onLevelChange={setLevel}
          onSubChange={setSub}
        />
        {waitingForSub ? (
          <p className='text-sm text-muted-foreground'>
            Chọn Sub-merchant để xem và cấu hình riêng.
          </p>
        ) : (
          <>
            {query.isFetching && !config && (
              <p
                role='status'
                className='py-4 text-sm text-muted-foreground'
              >
                Đang tải cấu hình…
              </p>
            )}
            {query.isError && !query.isFetching && (
              <div
                role='alert'
                className='flex items-center justify-between gap-2 text-sm text-danger-strong'
              >
                Không thể tải cấu hình.
                <ButtonComponent
                  type='default'
                  size='small'
                  content='Thử lại'
                  onClick={() => void query.refetch()}
                />
              </div>
            )}
            {config && (
              <PaymentMethodConfigBody
                editor={editor}
                config={config}
              />
            )}
          </>
        )}
      </div>
    </DialogModal>
  )
}
