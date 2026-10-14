import { useState } from 'react'

/**
 * Các dòng chính sách đang mở rộng. Trạng thái gắn với một khoá truy vấn: đổi bộ lọc hoặc trang thì
 * danh sách mở rộng tự về rỗng, không cần effect để reset.
 */
export const useExpandedPolicyIds = (resetKey: string) => {
  const [state, setState] = useState<{ queryKey: string; policyIds: string[] }>(
    {
      queryKey: resetKey,
      policyIds: []
    }
  )
  const expandedPolicyIds = state.queryKey === resetKey ? state.policyIds : []
  const updateExpandedPolicyIds = (update: (current: string[]) => string[]) =>
    setState((current) => ({
      queryKey: resetKey,
      policyIds: update(current.queryKey === resetKey ? current.policyIds : [])
    }))
  return { expandedPolicyIds, updateExpandedPolicyIds }
}
