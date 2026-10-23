import { useState } from 'react'
import {
  useChallengeCreateCredentialOtpMutation,
  useCreateGatewayCredentialMutation,
  usePrecheckGatewayCredentialCommandMutation,
  type CreateCredentialBody,
  type CredentialSecret,
  type MerchantApiAuthMode
} from '@/app/services/merchantGatewayApi'
import {
  DialogModal,
  Input,
  MerchantPickerDialog,
  PickerTrigger,
  SelectComponent,
  TextArea,
  describePicked,
  feedback,
  toPickedEntity,
  type PickedEntity
} from '@components/index'
import { AUTH_MODE_OPTIONS } from '../constants/credential.constants'
import { useCredentialOtp } from '../hooks/useCredentialOtp'
import { isPemPublicKey, parseIps } from '../utils/credential.utils'
import { CredentialFormError } from './CredentialFormError'
import { CredentialOtpDialog } from './CredentialOtpDialog'
import { CredentialScopeNotice } from './CredentialScopeNotice'
import { CredentialSectionHeading } from './CredentialSectionHeading'
import { PublicKeyField } from './PublicKeyField'

interface CreateCredentialDialogProps {
  initialMerchant?: PickedEntity
  onClose: () => void
  onCreated: (secret: CredentialSecret) => void
}

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
  const [authMode, setAuthMode] = useState<MerchantApiAuthMode>('HMAC_SHA256')
  const [publicKey, setPublicKey] = useState('')
  const [publicKeyError, setPublicKeyError] = useState('')
  const [precheck] = usePrecheckGatewayCredentialCommandMutation()
  const [challengeOtp] = useChallengeCreateCredentialOtpMutation()
  const [createCredential] = useCreateGatewayCredentialMutation()
  const { otp, begin } = useCredentialOtp<CredentialSecret>()
  const isRsa = authMode === 'RSA_SHA256'

  const save = () => {
    if (!selectedMerchant) {
      feedback.warning('Vui lòng chọn Merchant')
      return
    }
    const pem = publicKey.trim()
    if (isRsa && !isPemPublicKey(pem)) {
      setPublicKeyError('Vui lòng dán public key RSA dạng PEM')
      return
    }
    // BE từ chối public key đi kèm HMAC nên chỉ gửi khi chọn RSA.
    const body: CreateCredentialBody = {
      merchantId: selectedMerchant.id,
      authMode,
      ...(isRsa && { merchantPublicKey: pem }),
      ...(name.trim() && { name: name.trim() }),
      ipWhitelist: parseIps(ips)
    }
    void begin({
      precheck: () =>
        precheck({
          url: '/merchant-api-credentials',
          method: 'POST',
          body
        }).unwrap(),
      challenge: () =>
        challengeOtp({ merchantId: body.merchantId, authMode }).unwrap(),
      submit: (sensitiveOtp) =>
        createCredential({ ...body, sensitiveOtp }).unwrap(),
      onDone: (result) => {
        feedback.success('Đã tạo key kết nối')
        onCreated(result)
      }
    })
  }

  return (
    <DialogModal
      open
      width={{ xs: '95%', md: 680 }}
      title='Tạo key kết nối'
      onCancel={onClose}
      onOk={save}
      okButtonProps={{ loading: otp.isPreparing }}
      okText='Tạo key'
    >
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <CredentialSectionHeading
          index='I'
          title='Phạm vi áp dụng'
        />
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
        <CredentialSectionHeading
          index='II'
          title='Khóa kết nối'
          divided
        />
        <div>
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
        <div className='flex min-w-0 flex-col gap-1'>
          <label
            className='block text-sm font-medium'
            htmlFor='key-auth-mode'
          >
            Cơ chế xác thực
          </label>
          <SelectComponent
            id='key-auth-mode'
            aria-label='Cơ chế xác thực'
            className='w-full'
            value={authMode}
            options={AUTH_MODE_OPTIONS}
            onChange={(value: MerchantApiAuthMode) => setAuthMode(value)}
          />
        </div>
        {isRsa ? (
          <div className='col-span-full'>
            <PublicKeyField
              id='key-public-key'
              value={publicKey}
              error={publicKeyError}
              onChange={(value) => {
                setPublicKey(value)
                setPublicKeyError('')
              }}
            />
          </div>
        ) : (
          <>
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
          </>
        )}
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
            Để trống nếu chưa giới hạn IP được phép gọi API. Tối đa 50 IP / dải.
          </p>
        </div>
        <p className='col-span-full rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs leading-relaxed text-warning-strong'>
          {isRsa
            ? 'Client ID được hệ thống sinh khi tạo. Key RSA không có Secret Key; merchant ký bằng khóa riêng của mình.'
            : 'Client ID và Secret Key được hệ thống sinh khi tạo. Hãy sao chép Secret Key ngay sau khi tạo vì hệ thống chỉ hiển thị đầy đủ một lần.'}{' '}
          Cần xác nhận OTP trước khi tạo key.
        </p>
        <div className='col-span-full empty:hidden'>
          <CredentialFormError message={otp.formError} />
        </div>
      </div>
      <CredentialOtpDialog otp={otp} />
    </DialogModal>
  )
}
