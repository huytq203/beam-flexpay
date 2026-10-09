import { useState, type ReactNode } from 'react'
import type { ColumnsType } from 'antd/es/table'
import ButtonComponent from '../ui/button-component'
import CardComponent from '../ui/card-component'
import ModalComponent from '../ui/modal-component'
import Table from '../ui/table-component/TableComponent'
import { PickerSearchBar } from './PickerSearchBar'
import type { PickedEntity, PickerQueryResult } from './picker.types'
import type { PickerSearchState } from './usePickerSearch'

interface SingleSelection<T> {
  mode?: 'single'
  selectedId?: string
  onSelect: (row: T) => void
}

interface MultipleSelection<T> {
  mode: 'multiple'
  selected: readonly PickedEntity[]
  /** Trả nguyên bản ghi đã chọn để nơi dùng đọc được field riêng (vd. phạm vi). */
  onConfirm: (rows: (PickedEntity | T)[]) => void
}

export type PickerSelection<T> = SingleSelection<T> | MultipleSelection<T>

interface PickerModalProps {
  open: boolean
  title: string
  onCancel: () => void
  children: ReactNode
}

/**
 * Khung dialog chọn bản ghi có tìm kiếm + phân trang phía server. Select tải
 * sẵn một trang cố định không bao giờ tìm tới bản ghi nằm ngoài trang đó.
 * Nội dung bị hủy khi đóng để mỗi lần mở bắt đầu từ trang 1 và lựa chọn gốc.
 */
export function EntityPickerModal({
  open,
  title,
  onCancel,
  children
}: PickerModalProps) {
  return (
    <ModalComponent
      open={open}
      title={title}
      width={{ xs: 'calc(100vw - 24px)', md: 880 }}
      footer={null}
      destroyOnHidden
      onCancel={onCancel}
    >
      {children}
    </ModalComponent>
  )
}

type EntityPickerContentProps<T extends PickedEntity> = PickerSelection<T> & {
  entityLabel: string
  note?: string
  keywordOnly?: boolean
  /** Đặt tìm kiếm và bảng vào card viền 1px cho nổi trên nền modal. */
  framed?: boolean
  columns: ColumnsType<T>
  search: PickerSearchState
  query: PickerQueryResult<T>
  onCancel: () => void
}

export function EntityPickerContent<T extends PickedEntity>(
  props: EntityPickerContentProps<T>
) {
  const { entityLabel, note, columns, search, query, onCancel } = props
  const { page, size } = search
  const [draft, setDraft] = useState<(PickedEntity | T)[]>(() =>
    props.mode === 'multiple' ? [...props.selected] : []
  )
  const isMultiple = props.mode === 'multiple'
  const selectedId = props.mode === 'multiple' ? undefined : props.selectedId

  const toggle = (row: T, checked: boolean) =>
    setDraft((current) =>
      checked
        ? [...current.filter((item) => item.id !== row.id), row]
        : current.filter((item) => item.id !== row.id)
    )

  const indexColumn: ColumnsType<T>[number] = {
    title: '#',
    align: 'center',
    width: 60,
    render: (_value, _row, index) => (page - 1) * size + index + 1
  }
  const actionColumn: ColumnsType<T>[number] = {
    title: 'Thao tác',
    align: 'center',
    width: 110,
    render: (_value, row) => (
      <ButtonComponent
        htmlType='button'
        size='small'
        type={row.id === selectedId ? 'primary' : 'default'}
        content={row.id === selectedId ? 'Đã chọn' : 'Chọn'}
        aria-label={`Chọn ${entityLabel} ${row.name}`}
        onClick={() => props.mode !== 'multiple' && props.onSelect(row)}
      />
    )
  }

  const body = (
    <>
      {note && <p className='mb-3 text-sm text-muted-foreground'>{note}</p>}
      <PickerSearchBar
        entityLabel={entityLabel}
        name={search.name}
        code={search.code}
        onNameChange={search.setName}
        onCodeChange={search.setCode}
        keywordOnly={props.keywordOnly}
      />
      {query.isError && (
        <div
          role='alert'
          className='mb-3 flex items-center justify-between gap-2 text-sm text-danger-strong'
        >
          Không thể tải danh sách {entityLabel}.
          <ButtonComponent
            type='default'
            size='small'
            content='Thử lại'
            onClick={() => void query.refetch()}
          />
        </div>
      )}
      <Table<T>
        rowKey='id'
        size='small'
        loading={query.isFetching}
        onRefresh={query.refetch}
        dataSource={query.isError ? [] : query.rows}
        columns={[
          indexColumn,
          ...columns,
          ...(isMultiple ? [] : [actionColumn])
        ]}
        scroll={{ x: 720 }}
        rowClassName={(row) => (row.id === selectedId ? 'bg-accent' : '')}
        rowSelection={
          isMultiple
            ? {
                selectedRowKeys: draft.map((item) => item.id),
                preserveSelectedRowKeys: true,
                onSelect: (row, checked) => toggle(row, checked),
                onSelectAll: (checked, _rows, changed) =>
                  changed.forEach((row) => toggle(row, checked))
              }
            : undefined
        }
        pagination={{
          current: page,
          pageSize: size,
          total: query.total,
          showSizeChanger: true,
          onChange: search.changePage
        }}
      />
    </>
  )

  return (
    <>
      {props.framed ? (
        <CardComponent className='border border-border bg-background shadow-none'>
          {body}
        </CardComponent>
      ) : (
        body
      )}
      {props.mode === 'multiple' && (
        <div className='mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4'>
          <span
            aria-live='polite'
            className='text-sm text-muted-foreground tabular-nums'
          >
            Đã chọn {draft.length} {entityLabel}
          </span>
          <div className='flex gap-2'>
            <ButtonComponent
              htmlType='button'
              type='default'
              content='Hủy'
              onClick={onCancel}
            />
            <ButtonComponent
              htmlType='button'
              content='Xác nhận'
              onClick={() => props.onConfirm(draft)}
            />
          </div>
        </div>
      )}
    </>
  )
}
