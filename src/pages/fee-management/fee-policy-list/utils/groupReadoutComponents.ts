import {
  usesTiers,
  type FeeComponentFormValues
} from '@pages/fee-management/fee-config/schemas/feeConfig.schema'

export interface ReadoutGroup {
  key: string
  componentType: string
  /** Từ hai thành phần trở lên nghĩa là cùng một loại phí do nhiều bên chịu. */
  members: FeeComponentFormValues[]
}

/**
 * Gộp để HIỂN THỊ các thành phần cùng loại phí, cùng công thức và cùng cơ sở tính, chỉ khác bên
 * chịu hoặc mức phí. Dữ liệu không đổi: mỗi thành phần vẫn là một bản ghi riêng ở BE.
 *
 * Thành phần chia bậc không gộp vì mỗi bên chịu có bảng bậc riêng. Thứ tự nhóm theo lần xuất hiện
 * đầu tiên để số thứ tự trên màn hình không nhảy.
 */
export const groupReadoutComponents = (
  components: readonly FeeComponentFormValues[]
): ReadoutGroup[] => {
  const groups: ReadoutGroup[] = []
  const byKey = new Map<string, ReadoutGroup>()

  for (const component of components) {
    const key = usesTiers(component.calculationMethod)
      ? component.key
      : [
          component.componentType,
          component.calculationMethod,
          component.baseOn,
          component.baseComponentType ?? ''
        ].join('|')

    const existing = byKey.get(key)
    if (existing) {
      existing.members.push(component)
      continue
    }
    const group: ReadoutGroup = {
      key,
      componentType: component.componentType,
      members: [component]
    }
    byKey.set(key, group)
    groups.push(group)
  }
  return groups
}
