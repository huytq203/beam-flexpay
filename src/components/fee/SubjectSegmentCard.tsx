import ButtonComponent from '@components/ui/button-component'
import CardComponent from '@components/ui/card-component'
import {
  useAssignSubjectSegmentMutation,
  useClearSubjectSegmentMutation,
  useGetCustomerSegmentsQuery,
  useGetSubjectSegmentQuery,
  type SubjectType
} from '@services/apiCustomerSegment'
import { Select } from 'antd'
import { useMemo, useState } from 'react'

interface SubjectSegmentCardProps {
  /** Định danh chủ thể mà fee service dùng để tra phân khúc. */
  subjectId: string
  subjectType?: SubjectType
}

/**
 * Phân khúc khách hàng của một người dùng hoặc merchant.
 *
 * Đổi phân khúc có hiệu lực ngay ở lần định giá kế tiếp vì dịch vụ phí tra thẳng trong bảng.
 * Lệnh đang dở thì không đổi giá theo: mức phí đã bị khóa lúc khởi tạo, và lệnh đó sẽ bị từ
 * chối ở bước ghi sổ để khách khởi tạo lại với mức mới.
 */
export const SubjectSegmentCard = ({
  subjectId,
  subjectType = 'USER'
}: SubjectSegmentCardProps) => {
  const hasSubject = Boolean(subjectId)
  const { data: segments, isLoading: isLoadingSegments } =
    useGetCustomerSegmentsQuery(undefined, { skip: !hasSubject })
  const { data: current, isFetching } = useGetSubjectSegmentQuery(
    { subjectType, subjectId },
    { skip: !hasSubject }
  )

  const [assign, { isLoading: isAssigning }] = useAssignSubjectSegmentMutation()
  const [clear, { isLoading: isClearing }] = useClearSubjectSegmentMutation()
  // `undefined` nghĩa là người dùng chưa chạm vào ô, nên ô bám theo giá trị server; `null`
  // nghĩa là họ chủ động xoá. Suy ra giá trị hiển thị thay vì đồng bộ bằng effect, để ô không
  // nhảy về giá trị cũ mỗi lần query chạy lại.
  const [draft, setDraft] = useState<string | null | undefined>(undefined)
  const selected =
    draft === undefined ? (current?.segmentCode ?? undefined) : (draft ?? undefined)
  const options = useMemo(() => {
    const activeOptions = (segments ?? []).map((segment) => ({
      value: segment.code,
      label: segment.name
        ? `${segment.name} (${segment.code})`
        : segment.code
    }))

    if (selected && !activeOptions.some((option) => option.value === selected)) {
      activeOptions.push({ value: selected, label: selected })
    }

    return activeOptions
  }, [segments, selected])

  if (!hasSubject) return null

  const isBusy = isAssigning || isClearing || isFetching
  const isDirty = (selected ?? '') !== (current?.segmentCode ?? '')

  const handleSave = async () => {
    if (!isDirty) return
    try {
      if (selected) {
        await assign({ subjectType, subjectId, segmentCode: selected }).unwrap()
      } else {
        await clear({ subjectType, subjectId }).unwrap()
      }
      setDraft(undefined)
    } catch {
      // fetchBaseQueryCustom đã bắn notification lỗi tập trung.
    }
  }

  return (
    <CardComponent
      className='mt-3'
      content={
        <section aria-labelledby='customer-segment-title'>
          <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
            <h2
              id='customer-segment-title'
              className='text-base font-semibold text-foreground'
            >
              Phân khúc khách hàng
            </h2>
            {current?.updatedBy ? (
              <span className='text-xs text-muted-foreground'>
                Đổi gần nhất bởi {current.updatedBy}
              </span>
            ) : null}
          </div>

          <div className='flex flex-wrap items-center gap-3'>
            <Select
              className='min-w-60'
              value={selected}
              onChange={(value) => setDraft(value ?? null)}
              loading={isLoadingSegments}
              disabled={isBusy}
              allowClear
              showSearch
              optionFilterProp='label'
              placeholder='Chưa thuộc phân khúc nào'
              options={options}
            />
            <ButtonComponent
              type='primary'
              htmlType='button'
              content='Lưu phân khúc'
              disabled={!isDirty || isBusy}
              loading={isAssigning || isClearing}
              onClick={handleSave}
            />
          </div>

        </section>
      }
    />
  )
}
