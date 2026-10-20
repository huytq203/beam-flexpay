import type { UseFormSetValue } from 'react-hook-form'
import { VAT_COMPONENT_TYPE } from '../constants/feeConfigFields'
import {
  CalculationMethod,
  usesTiers,
  type FeeComponentFormValues
} from '../schemas/feeConfig.schema'

type SetValue = UseFormSetValue<FeeComponentFormValues>

interface UseFeeComponentFieldHandlersInput {
  setValue: SetValue
  receiverSetValue: SetValue
  componentType: string
  /** Phí gốc của nhóm mà VAT trỏ sẵn tới, hoặc null khi nó chưa đứng phía trên. */
  vatBaseAbove: string | null
}

interface FeeComponentFieldHandlers {
  handleComponentTypeChange: (next: string | number) => void
  handleMethodChange: (next: string | number) => void
  handlePayerChange: (next: string | number) => void
}

export const useFeeComponentFieldHandlers = ({
  setValue,
  receiverSetValue,
  componentType,
  vatBaseAbove
}: UseFeeComponentFieldHandlersInput): FeeComponentFieldHandlers => {
  /**
   * Thuế giá trị gia tăng luôn tính trên khoản phí gốc của nhóm. Khoá luôn ô cơ sở tính
   * thay vì để người dùng chọn rồi báo lỗi ở bước lưu.
   *
   * Chỉ trỏ sẵn sang phí giao dịch khi nó thật sự đứng phía trên. Gán một tham
   * chiếu tới thành phần chưa tồn tại chỉ tạo ra một ô hiển thị mã enum thô mà
   * người dùng không sửa được.
   */
  const handleComponentTypeChange = (next: string | number) => {
    if (next !== VAT_COMPONENT_TYPE) {
      if (componentType === VAT_COMPONENT_TYPE) {
        setValue('baseOn', 'AMOUNT', { shouldValidate: true })
        setValue('baseComponentType', null, { shouldValidate: true })
      }
      return
    }
    setValue('baseOn', 'FEE_COMPONENT', { shouldValidate: true })
    setValue('baseComponentType', vatBaseAbove, { shouldValidate: true })
    setValue('calculationMethod', CalculationMethod.DIRECT)
    setValue('fixedAmount', null)
    setValue('minFee', null)
    setValue('maxFee', null)
    setValue('tiers', [])
  }

  const handleMethodChange = (next: string | number) => {
    for (const set of [setValue, receiverSetValue]) {
      set('tiers', [])
      // Bậc thang lấy số từ bảng bậc: bỏ các ô của cách tính mặc định để không gửi thừa.
      if (usesTiers(String(next))) {
        set('percentage', null)
        set('fixedAmount', null)
        set('minFee', null)
        set('maxFee', null)
      }
    }
  }

  // Đổi người chịu chỉ gợi ý lại người hưởng mặc định; người dùng vẫn sửa được sau đó.
  const handlePayerChange = (next: string | number) => {
    setValue('beneficiaryType', next === 'SYSTEM' ? 'BANK' : 'SYSTEM', {
      shouldValidate: true
    })
    setValue('baseComponentType', null, { shouldValidate: true })
  }

  return { handleComponentTypeChange, handleMethodChange, handlePayerChange }
}
