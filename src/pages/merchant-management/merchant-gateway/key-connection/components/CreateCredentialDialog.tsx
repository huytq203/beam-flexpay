import { useState } from 'react'
import {
  useCreateGatewayCredentialMutation,
  type CredentialSecret
} from '@/app/services/merchantGatewayApi'
import {
  DialogModal,
  Input,
  MerchantPickerDialog,
  PickerTrigger,
  TextArea,
  describePicked,
  feedback,
  toPickedEntity,
  type PickedEntity
} from '@components/index'
import { CredentialScopeNotice } from './CredentialScopeNotice'

interface CreateCredentialDialogProps {
  initialMerchant?: PickedEntity
  onClose: () => void
  onCreated: (secret: CredentialSecret) => void
}

const parseIps = (value: string): string[] =>
  value
    .split(/[\s,;]+/)
    .map((ip) => ip.trim())
    .filter(Boolean)

// Mount mỗi lần mở nên form luôn bắt đầu từ Merchant đang lọc và ô trống.
export function CreateCredentialDialog({
  initialMerchant,
  onClose,
  onCreated
}: CreateCredentialDialogProps) {
  const [selectedMerchant, setSelectedMerchant] = useState(initialMerchant)
  const [isPickingMerchant, setIsPickingMerchant] = useState(false)
  const [name, setName] = useState('')
  const [ips, setIps] = useState('')
  const [createCredential, createState] = useCreateGatewayCredentialMutation()

  const save = async () => {
    if (!selectedMerchant) {
      feedback.warning('Vui lòng chọn Merchant')
      return
    }
    try {
      const result = await createCredential({
        merchantId: selectedMerchant.id,
        name: name.trim() || undefined,
        ipWhitelist: parseIps(ips)
      }).unwrap()
      onCreated(result)
      feedback.success('Đã tạo key kết nối')
    } catch {
      feedback.error('Không thể tạo key kết nối')
    }
  }

  return (
    <DialogModal
      open
      width={{ xs: '95%', md: 680 }}
      title='Tạo key kết nối'
      onCancel={onClose}
      onOk={() => void save()}
      okButtonProps={{ loading: createState.isLoading }}
      okText='Tạo key'
    >
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <div className='col-span-full flex items-center gap-2'>
          <span
            aria-hidden
            className='flex size-6 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground'
          >
            I
          </span>
          <h2 className='text-xs font-semibold uppercase tracking-[0.05em] text-secondary-foreground'>
            Phạm vi áp dụng
          </h2>
        </div>
        <div className='col-span-full'>
          <PickerTrigger
            id='credential-merchant'
            label='Chọn Master Merchant'
            required
            value={describePicked(selectedMerchant)}
            placeholder='Tìm theo tên hoặc mã Merchant'
            onOpen={() => setIsPickingMerchant(true)}
          />
          <MerchantPickerDialog
            open={isPickingMerchant}
            title='Chọn Master Merchant'
            status='ACTIVE'
            selectedId={selectedMerchant?.id}
            onCancel={() => setIsPickingMerchant(false)}
            onSelect={(value) => {
              setSelectedMerchant(toPickedEntity(value))
              setIsPickingMerchant(false)
            }}
          />
        </div>
        <div className='col-span-full'>
          <CredentialScopeNotice />
        </div>
        <div className='col-span-full mt-1 flex items-center gap-2 border-t border-border pt-4'>
          <span
            aria-hidden
            className='flex size-6 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground'
          >
            II
          </span>
          <h2 className='text-xs font-semibold uppercase tracking-[0.05em] text-secondary-foreground'>
            Khóa kết nối
          </h2>
        </div>
        <div className='col-span-full'>
          <label
            className='mb-1 block text-sm font-medium'
            htmlFor='key-name'
          >
            Tên gợi nhớ (tùy chọn)
          </label>
          <Input
            id='key-name'
            placeholder='Ví dụ: Tích hợp sản xuất'
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={100}
          />
        </div>
        <div>
          <label
            className='mb-1 block text-sm font-medium'
            htmlFor='key-generated-client'
          >
            Client ID / Merchant Key
          </label>
          <Input
            id='key-generated-client'
            value='Được tạo tự động'
            disabled
          />
        </div>
        <div>
          <label
            className='mb-1 block text-sm font-medium'
            htmlFor='key-generated-secret'
          >
            Secret Key
          </label>
          <Input
            id='key-generated-secret'
            value='Chỉ hiển thị sau khi tạo'
            disabled
          />
        </div>
        <div className='col-span-full'>
          <label
            className='mb-1 block text-sm font-medium'
            htmlFor='key-ips'
          >
            IP Whitelist (tùy chọn)
          </label>
          <TextArea
            id='key-ips'
            value={ips}
            onChange={(event) => setIps(event.target.value)}
            rows={3}
            placeholder='Mỗi IP hoặc dải CIDR một dòng'
          />
          <p className='mt-1 text-xs text-muted-foreground'>
            Để trống nếu chưa giới hạn IP được phép gọi API.
          </p>
        </div>
        <p className='col-span-full rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs leading-relaxed text-warning-strong'>
          Client ID và Secret Key được hệ thống sinh khi tạo. Hãy sao chép
          Secret Key ngay sau khi tạo vì hệ thống chỉ hiển thị đầy đủ một lần.
        </p>
      </div>
    </DialogModal>
  )
}
