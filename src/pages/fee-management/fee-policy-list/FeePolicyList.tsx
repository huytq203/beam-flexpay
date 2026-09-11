import { Can } from '@/app/permissions'
import { FeeDomainTabs } from '@components/fee/FeeDomainTabs'
import { FeeDomain, isFeeDomain } from '@components/fee/feeDomain'
import { PlusIcon, WarningCircleIcon } from '@components/icons'
import {
  ButtonComponent,
  CardComponent,
  ReasonDialog,
  Table
} from '@components/index'
import { PATHS } from '@constants/pathConstant'
import { useUrlFilters } from '@hooks/useUrlFilters'
import { isFeeDirection } from '@utils/fee-direction'
import { useNavigate } from 'react-router-dom'
import { FeePolicyFilterBar } from './components/FeePolicyFilterBar'
import { getFeePolicyColumns } from './columns/FeePolicyList.column'
import { useFeePolicyList } from './hooks/useFeePolicyList'
import { useFeePolicyStatus } from './hooks/useFeePolicyStatus'

const FILTER_KEYS = [
  'feeDomain',
  'keyword',
  'status',
  'direction',
  'serviceType'
] as const

/**
 * Danh sách chính sách phí của cả ba miền, thay cho ba màn danh sách rời trước
 * đây. Miền phí là tab chứ không phải ô lọc: đổi miền là đổi cả tập loại giao
 * dịch hợp lệ lẫn ý nghĩa của bản ghi.
 */
const FeePolicyList = () => {
  const navigate = useNavigate()
  const { filters, applyFilters, clearFilters, page, size, setPage, setPageSize } =
    useUrlFilters({ keys: FILTER_KEYS })

  const feeDomain = isFeeDomain(filters.feeDomain)
    ? filters.feeDomain
    : FeeDomain.EWALLET
  const direction = isFeeDirection(filters.direction) ? filters.direction : null

  const status = useFeePolicyStatus()
  const { rows, total, isFetching, isError, refetch } = useFeePolicyList({
    filters: {
      feeDomain,
      keyword: filters.keyword,
      serviceType: filters.serviceType,
      status: filters.status
    },
    page,
    size
  })

  // Đổi miền phí thì loại giao dịch và chiều tiền cũ không còn nghĩa — giữ lại
  // là bảng trống mà người dùng không hiểu vì sao.
  const handleDomainChange = (next: FeeDomain) =>
    applyFilters({
      feeDomain: next,
      keyword: filters.keyword ?? null,
      status: filters.status ?? null,
      direction: null,
      serviceType: null
    })

  return (
    <>
      <CardComponent className='mb-3!'>
        <p className='max-w-[70ch] border-b border-border pb-4 text-[13px] text-muted-foreground'>
          Biểu phí đang khai báo trong hệ thống, tách theo miền phí.
        </p>

        <FeeDomainTabs
          value={feeDomain}
          onChange={handleDomainChange}
          className='mt-4'
        />

        <div className='mt-4 border-t border-border pt-4'>
          <FeePolicyFilterBar
            feeDomain={feeDomain}
            direction={direction}
            serviceType={filters.serviceType}
            values={{
              keyword: filters.keyword ?? '',
              status: filters.status ?? ''
            }}
            onScopeChange={(next) =>
              applyFilters({
                feeDomain,
                keyword: filters.keyword ?? null,
                status: filters.status ?? null,
                direction: next.direction,
                serviceType: next.serviceType ?? null
              })
            }
            onSubmit={(values) =>
              applyFilters({
                feeDomain,
                direction: filters.direction ?? null,
                serviceType: filters.serviceType ?? null,
                keyword: values.keyword,
                status: values.status
              })
            }
            onReset={() => {
              clearFilters()
              applyFilters({ feeDomain })
            }}
          />
        </div>

        <div className='mt-4 flex justify-end border-t border-border pt-4'>
          <Can screen='FEE_CONFIG' action='create'>
            <ButtonComponent
              htmlType='button'
              type='primary'
              content='Thêm chính sách phí'
              icon={<PlusIcon size={16} weight='bold' aria-hidden />}
              onClick={() => navigate(PATHS.FEE_V4.POLICY_CREATE)}
              className='w-full md:w-auto'
            />
          </Can>
        </div>
      </CardComponent>

      <CardComponent>
        {isError ? (
          <div className='flex flex-col items-start gap-3 py-8'>
            <p className='flex items-center gap-2 text-[13px] font-semibold text-danger-strong'>
              <WarningCircleIcon size={18} weight='bold' aria-hidden />
              Không tải được danh sách chính sách phí
            </p>
            <p className='max-w-[60ch] text-[13px] text-muted-foreground'>
              Dịch vụ phí chưa trả lời. Thử lại; nếu vẫn lỗi thì báo đội vận hành
              hệ thống.
            </p>
            <ButtonComponent
              htmlType='button'
              type='default'
              content='Thử lại'
              onClick={refetch}
            />
          </div>
        ) : (
          <Table
            tableLayout='fixed'
            size='small'
            rowKey='key'
            dataSource={rows}
            columns={getFeePolicyColumns({
              onEdit: (id) => navigate(PATHS.FEE_V4.POLICY_EDIT(id)),
              onActivate: status.askActivate,
              onDeactivate: status.deactivate,
              busyId: status.busyId
            })}
            loading={isFetching}
            onRefresh={refetch}
            scroll={{ x: 'max-content' }}
            pagination={{
              current: page,
              pageSize: size,
              total,
              showSizeChanger: true,
              onChange: (nextPage, nextSize) => {
                if (nextSize !== size) {
                  setPageSize(nextSize)
                  return
                }
                setPage(nextPage)
              }
            }}
          />
        )}
      </CardComponent>

      <ReasonDialog
        open={Boolean(status.activating)}
        title='Kích hoạt chính sách phí'
        description={
          status.activating
            ? `Chính sách “${status.activating.name}” sẽ bắt đầu áp vào giao dịch thật.`
            : ''
        }
        label='Lý do kích hoạt'
        placeholder='Ví dụ: áp dụng biểu phí mới từ đầu quý'
        okText='Kích hoạt'
        confirmLoading={status.isActivating}
        onConfirm={status.confirmActivate}
        onCancel={status.cancelActivate}
      />
    </>
  )
}

export default FeePolicyList
