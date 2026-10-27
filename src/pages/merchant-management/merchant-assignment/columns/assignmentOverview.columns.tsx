import { TagComponent } from '@components/index'
import type { TableComponentProps } from '@components/ui/table-component/TableComponent'
import type { AssignmentListItem } from '@/app/services/merchantAssignmentApi'
import { formatOrderDateTime } from '../../merchant-order/utils/merchantOrder.utils'
import { AssigneeCell } from '../components/AssigneeCell'
import { NamedCell } from '../components/NamedCell'
import { ASSIGNMENT_LEVEL_LABELS } from '../constants/merchantAssignment.constants'
import { toAssignedByLabel } from '../utils/assignmentDisplay.utils'

interface Options {
  page: number
  pageSize: number
}

/** `#` tính theo trang và kích thước trang vì BE phân trang (page từ 1). */
export const createAssignmentOverviewColumns = ({
  page,
  pageSize
}: Options): NonNullable<
  TableComponentProps<AssignmentListItem>['columns']
> => [
  {
    title: '#',
    align: 'center',
    width: 64,
    render: (_value, _row, index) => (page - 1) * pageSize + index + 1
  },
  {
    title: 'Cấp',
    width: 130,
    render: (_, row) => (
      <TagComponent color={row.level === 'MASTER' ? 'blue' : 'default'}>
        {ASSIGNMENT_LEVEL_LABELS[row.level === 'MASTER' ? 'master' : 'sub']}
      </TagComponent>
    )
  },
  {
    title: 'Merchant',
    width: 220,
    render: (_, row) => (
      <NamedCell
        name={row.merchantName}
        code={row.merchantCode}
      />
    )
  },
  {
    title: 'Sub-merchant',
    width: 220,
    render: (_, row) => (
      <NamedCell
        name={row.subMerchantName}
        code={row.subMerchantCode}
      />
    )
  },
  {
    title: 'Người phụ trách',
    width: 260,
    render: (_, row) => <AssigneeCell {...row} />
  },
  {
    title: 'Gán lúc',
    width: 180,
    render: (_, row) => formatOrderDateTime(row.assignedAt)
  },
  {
    title: 'Gán bởi',
    width: 200,
    render: (_, row) => toAssignedByLabel(row.assignedBy, row.assignedByName)
  }
]
