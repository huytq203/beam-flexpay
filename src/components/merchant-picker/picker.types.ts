/** Bản ghi đã chọn qua dialog, giữ đủ mã + tên để hiện lại mà không phải gọi API. */
export interface PickedEntity {
  id: string
  code: string
  name: string
}

export interface PickerSearchParams {
  page: number
  size: number
  name?: string
  code?: string
}

export interface PickerQueryResult<T> {
  rows: T[]
  total: number
  isFetching: boolean
  isError: boolean
  refetch: () => void | Promise<unknown>
}

export const toPickedEntity = ({
  id,
  code,
  name
}: PickedEntity): PickedEntity => ({
  id,
  code,
  name
})

export const describePicked = (entity?: PickedEntity): string | undefined => {
  if (!entity) return undefined
  return entity.code ? `${entity.code} — ${entity.name}` : entity.name
}
