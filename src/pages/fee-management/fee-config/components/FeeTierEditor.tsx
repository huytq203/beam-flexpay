import { FormInputNumber } from '@components/form'
import { PlusIcon, TrashIcon } from '@components/icons'
import { ButtonComponent, TooltipComponent } from '@components/index'
import { formatFeeNumber } from '@utils/fee-format'
import type { Control } from 'react-hook-form'
import { Fragment } from 'react'
import { useFieldArray, useFormState, useWatch } from 'react-hook-form'
import {
  TIER_RATE_MISSING_MESSAGE,
  getTierStart,
  type FeeComponentFormValues
} from '../schemas/feeConfig.schema'

interface FeeTierEditorProps {
  control: Control<FeeComponentFormValues>
  error?: string
  /** Xem `FormField.idPrefix`; dùng cho bảng bậc của người nhận. */
  idPrefix?: string
}

const COLUMN_COUNT = 7

const TIER_FIELDS = [
  'maxValue',
  'percentage',
  'fixedAmount',
  'minFee',
  'maxFee'
] as const

const HEAD =
  'text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'

/**
 * Bảng bậc phí.
 *
 * Giá trị bắt đầu của mỗi bậc là suy ra, không nhập và không lưu: backend đòi
 * bậc sau bắt đầu ngay sau giá trị kết thúc của bậc trước. Vì vậy nút thêm bậc
 * chỉ mở khi bậc cuối đã có giá trị kết thúc — chưa chốt điểm cuối thì chưa có
 * gì để nối tiếp, và bậc mới sẽ bắt đầu sai chỗ.
 */
export const FeeTierEditor = ({
  control,
  error,
  idPrefix
}: FeeTierEditorProps) => {
  const { fields, append, remove } = useFieldArray({ control, name: 'tiers' })
  const tiers = useWatch({ control, name: 'tiers' }) ?? []
  const { errors } = useFormState({ control })

  /**
   * Lỗi của một bậc gom lại thành một dòng riêng dưới hàng đó, không in vào từng ô: ô hẹp
   * làm câu lỗi xuống nhiều dòng, kéo cao hàng và đẩy lệch các ô còn lại.
   */
  const rowMessages = (index: number): string[] => {
    const rowErrors = errors.tiers?.[index]
    if (!rowErrors) return []
    return [
      ...new Set(
        TIER_FIELDS.map((field) => rowErrors[field]?.message)
          .filter((message): message is string => Boolean(message))
      )
    ]
  }
  const hasRateMissingError = tiers.some((_, index) =>
    rowMessages(index).includes(TIER_RATE_MISSING_MESSAGE)
  )

  const lastMax = tiers.at(-1)?.maxValue
  const canAppend =
    fields.length === 0 || (lastMax !== null && lastMax !== undefined)

  const handleAppend = () =>
    append({
      maxValue: null,
      fixedAmount: null,
      percentage: null,
      minFee: null,
      maxFee: null
    })

  const addButton = (
    <ButtonComponent
      htmlType='button'
      type='default'
      content='Thêm bậc phí'
      icon={
        <PlusIcon
          size={14}
          weight='bold'
          aria-hidden
        />
      }
      disabled={!canAppend}
      onClick={handleAppend}
    />
  )

  return (
    <div>
      <div className='mb-2 flex flex-wrap items-center justify-between gap-2'>
        <p className={HEAD}>Bậc phí</p>
        {canAppend ? (
          addButton
        ) : (
          <TooltipComponent title='Điền giá trị đến của bậc cuối trước, bậc mới sẽ nối tiếp từ đó'>
            <span>{addButton}</span>
          </TooltipComponent>
        )}
      </div>

      {/* Lỗi của hàng đã nói đúng câu này, nên gợi ý chỉ hiện khi chưa có lỗi đó. */}
      {!hasRateMissingError && (
        <p className='mb-2 text-[13px] text-muted-foreground'>
          Bậc không thu phí: nhập 0 vào Phí linh hoạt hoặc Phí cố định, để trống Sàn.
        </p>
      )}

      {fields.length === 0 ? (
        <p className='rounded-lg border border-dashed border-border px-4 py-6 text-center text-[13px] text-muted-foreground'>
          Công thức bậc thang cần ít nhất một bậc. Bấm Thêm bậc phí để bắt đầu
          từ 0 đồng.
        </p>
      ) : (
        <div className='overflow-x-auto rounded-lg border border-border'>
          <table className='w-full min-w-[680px] border-collapse'>
            <thead>
              <tr className='bg-muted'>
                <th className={`${HEAD} px-3 py-2 text-right`}>Từ</th>
                <th className={`${HEAD} px-3 py-2 text-left`}>Đến</th>
                <th className={`${HEAD} px-3 py-2 text-left`}>Phí linh hoạt (%)</th>
                <th className={`${HEAD} px-3 py-2 text-left`}>Phí cố định</th>
                <th className={`${HEAD} px-3 py-2 text-left`}>Sàn</th>
                <th className={`${HEAD} px-3 py-2 text-left`}>Trần</th>
                <th className='w-12 px-3 py-2' />
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => {
                const messages = rowMessages(index)
                const rateInvalid = messages.includes(TIER_RATE_MISSING_MESSAGE)
                return (
                <Fragment key={field.id}>
                <tr className='border-t border-border align-middle'>
                  <td className='whitespace-nowrap px-3 py-2 text-right text-[13px] tabular-nums text-foreground'>
                    {formatFeeNumber(getTierStart(tiers, index))}
                  </td>
                  <td className='px-3 py-2'>
                    <FormInputNumber
                      thousandSeparator
                      name={`tiers.${index}.maxValue`}
                      control={control}
                      idPrefix={idPrefix}
                      // Bậc cuối để trống nghĩa là chạy tới vô cùng, nên ô này
                      // phải giữ trạng rỗng thay vì rơi về 0.
                      allowEmpty
                      placeholder='Trống = vô cùng'
                      hideError
                      className='flex flex-col'
                    />
                  </td>
                  <td className='px-3 py-2'>
                    <FormInputNumber
                      thousandSeparator
                      name={`tiers.${index}.percentage`}
                      control={control}
                      idPrefix={idPrefix}
                      invalid={rateInvalid}
                      allowEmpty
                      placeholder='0'
                      hideError
                      className='flex flex-col'
                    />
                  </td>
                  <td className='px-3 py-2'>
                    <FormInputNumber
                      thousandSeparator
                      name={`tiers.${index}.fixedAmount`}
                      control={control}
                      idPrefix={idPrefix}
                      invalid={rateInvalid}
                      allowEmpty
                      placeholder='0'
                      hideError
                      className='flex flex-col'
                    />
                  </td>
                  <td className='px-3 py-2'>
                    <FormInputNumber
                      thousandSeparator
                      name={`tiers.${index}.minFee`}
                      control={control}
                      idPrefix={idPrefix}
                      allowEmpty
                      placeholder='0'
                      hideError
                      className='flex flex-col'
                    />
                  </td>
                  <td className='px-3 py-2'>
                    <FormInputNumber
                      thousandSeparator
                      name={`tiers.${index}.maxFee`}
                      control={control}
                      idPrefix={idPrefix}
                      allowEmpty
                      placeholder='0'
                      hideError
                      className='flex flex-col'
                    />
                  </td>
                  <td className='px-3 py-2 text-center'>
                    {index === fields.length - 1 && (
                      <TooltipComponent title='Xoá bậc cuối'>
                        <ButtonComponent
                          htmlType='button'
                          type='default'
                          aria-label='Xoá bậc cuối'
                          icon={
                            <TrashIcon
                              size={14}
                              weight='bold'
                              aria-hidden
                            />
                          }
                          onClick={() => remove(index)}
                        />
                      </TooltipComponent>
                    )}
                  </td>
                </tr>
                {messages.length > 0 && (
                  <tr>
                    <td
                      colSpan={COLUMN_COUNT}
                      className='px-3 pb-2 text-[13px] font-medium text-danger-strong'
                    >
                      <p role='alert'>{messages.join(' · ')}</p>
                    </td>
                  </tr>
                )}
                </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {error && (
        <p className='mt-2 text-[13px] font-medium text-danger-strong'>
          {error}
        </p>
      )}
    </div>
  )
}
