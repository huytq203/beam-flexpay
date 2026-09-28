import type { UseFormReturn } from 'react-hook-form'
import type {
  ApiSubMerchantSummary,
  ApiTerminal,
  ApiTerminalType
} from '@/app/services/merchantHierarchyApi'
import {
  FormInput,
  FormSelect,
  FormSwitch,
  FormTextArea
} from '@components/form'
import { CardComponent, Input, type PickedEntity } from '@components/index'
import type { TerminalApiDraft } from '../schemas/terminalApi.schema'
import { TerminalOwnerSection } from './TerminalOwnerSection'

interface TerminalApiFormFieldsProps {
  form: UseFormReturn<TerminalApiDraft>
  edit: boolean
  source?: ApiTerminal
  terminalType: ApiTerminalType
  inheritContactPhone: boolean
  master?: PickedEntity
  sub?: PickedEntity
  inheritedPhone?: string
  onPickMaster: (merchant?: PickedEntity) => void
  onPickSub: (sub?: ApiSubMerchantSummary) => void
}

const fieldClass = 'min-w-0 flex flex-col gap-1.5'
const labelClass = 'text-sm font-medium text-foreground'

export function TerminalApiFormFields({
  form,
  edit,
  source,
  terminalType,
  inheritContactPhone,
  master,
  sub,
  inheritedPhone,
  onPickMaster,
  onPickSub
}: TerminalApiFormFieldsProps) {
  return (
    <CardComponent className='border border-border bg-background shadow-none'>
      <div className='space-y-6'>
        <TerminalOwnerSection
          form={form}
          edit={edit}
          tid={source?.tid}
          master={master}
          sub={sub}
          onPickMaster={onPickMaster}
          onPickSub={onPickSub}
        />
        <section className='space-y-4 border-t border-border pt-5'>
          <div>
            <h2 className='text-base font-semibold text-foreground'>
              Thông tin Terminal
            </h2>
            <p className='mt-1 text-sm text-muted-foreground'>
              Tên và loại hình giúp nhận diện điểm bán trong danh sách và báo
              cáo.
            </p>
          </div>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <FormInput
              control={form.control}
              name='name'
              label='Tên Terminal'
              placeholder='Ví dụ: Quầy thu ngân 1'
              maxLength={100}
              required
              className={fieldClass}
              classNameLable={labelClass}
            />
            <FormSelect
              control={form.control}
              name='terminalType'
              label='Loại Terminal'
              required
              options={[
                { label: 'QR', value: 'QR' },
                { label: 'POS', value: 'POS' },
                { label: 'Trực tuyến', value: 'ONLINE' }
              ]}
              className={fieldClass}
              classNameLable={labelClass}
            />
            {terminalType !== 'ONLINE' && (
              <FormInput
                control={form.control}
                name='address'
                label='Địa chỉ điểm bán'
                placeholder='Địa chỉ hoặc vị trí đặt thiết bị'
                maxLength={400}
                required={terminalType === 'POS'}
                className={`${fieldClass} md:col-span-2`}
                classNameLable={labelClass}
              />
            )}
          </div>
          <p className='rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm leading-5 text-muted-foreground'>
            Terminal kế thừa hình thức thanh toán và hạn mức từ Sub-merchant
            {sub ? ` ${sub.name}` : ''}. Cấu hình được quản lý tại cấp trên.
          </p>
        </section>
        <section className='space-y-4 border-t border-border pt-5'>
          <div>
            <h2 className='text-base font-semibold text-foreground'>
              Liên hệ & ghi chú
            </h2>
            <p className='mt-1 text-sm text-muted-foreground'>
              Thông tin hỗ trợ vận hành tại điểm bán.
            </p>
          </div>
          <FormSwitch
            control={form.control}
            name='inheritContactPhone'
            label='Kế thừa số điện thoại Sub-merchant'
            description='Tắt để nhập số điện thoại riêng cho Terminal.'
          />
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <FormInput
              control={form.control}
              name='contactPerson'
              label='Người liên hệ'
              placeholder='Họ tên người phụ trách'
              maxLength={50}
              className={fieldClass}
              classNameLable={labelClass}
            />
            {inheritContactPhone ? (
              <div className={fieldClass}>
                <label
                  htmlFor='inherited-contact-phone'
                  className={`${labelClass} inline-flex items-center`}
                >
                  Số điện thoại liên hệ
                </label>
                <Input
                  id='inherited-contact-phone'
                  disabled
                  value={
                    inheritedPhone ||
                    (edit ? source?.contactPhone?.value : undefined) ||
                    ''
                  }
                  placeholder='Kế thừa từ Sub-merchant'
                />
              </div>
            ) : (
              <FormInput
                control={form.control}
                name='contactPhone'
                label='Số điện thoại liên hệ'
                placeholder='Nhập số điện thoại'
                maxLength={15}
                required
                className={fieldClass}
                classNameLable={labelClass}
              />
            )}
            <FormTextArea
              control={form.control}
              name='note'
              label='Ghi chú'
              placeholder='Thông tin bổ sung về Terminal'
              rows={3}
              maxLength={500}
              className={`${fieldClass} md:col-span-2`}
              classNameLable={labelClass}
            />
          </div>
        </section>
      </div>
    </CardComponent>
  )
}
