import { DialogModal } from '@components/index'
import {
  useNotificationEditor,
  type NotificationEditorTarget
} from '../hooks/useNotificationEditor'
import { describeChanges } from '../utils/notification.utils'
import { NotificationFormFields } from './NotificationFormFields'
import { NotificationScopeFields } from './NotificationScopeFields'

interface NotificationEditorDialogProps {
  target: NotificationEditorTarget
  onClose: () => void
}

const TITLE: Record<NotificationEditorTarget['mode'], string> = {
  create: 'Thêm cấu hình thông báo',
  setup: 'Thiết lập cấu hình riêng',
  edit: 'Cập nhật cấu hình thông báo'
}

// Mount mỗi lần mở nên form luôn bắt đầu từ giá trị đang hiệu lực của dòng.
export function NotificationEditorDialog({
  target,
  onClose
}: NotificationEditorDialogProps) {
  const editor = useNotificationEditor(target, onClose)
  const isEdit = target.mode === 'edit'
  const changedLabels = describeChanges(editor.changes)

  return (
    <DialogModal
      open
      width={{ xs: 'calc(100vw - 24px)', md: 720 }}
      title={TITLE[target.mode]}
      okText={isEdit ? 'Lưu thay đổi' : 'Tạo cấu hình'}
      okButtonProps={{ loading: editor.isSaving }}
      onCancel={onClose}
      onOk={() => void editor.save()}
    >
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        {target.mode === 'setup' && (
          <p className='text-sm text-muted-foreground sm:col-span-2'>
            Form đang điền sẵn giá trị phạm vi này đang dùng. Lưu lại sẽ tạo cấu
            hình riêng, không ảnh hưởng cấp trên.
          </p>
        )}
        <NotificationScopeFields
          scope={editor.scope}
          locked={target.mode !== 'create'}
          onChange={editor.setScope}
        />
        <NotificationFormFields
          draft={editor.draft}
          errors={editor.errors}
          requireReason={isEdit}
          onChange={editor.patchDraft}
        />
        {isEdit && (
          <p
            aria-live='polite'
            className='rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground sm:col-span-2'
          >
            {changedLabels.length
              ? `Sẽ cập nhật: ${changedLabels.join(', ')}.`
              : 'Chưa có thay đổi nào.'}
          </p>
        )}
      </div>
    </DialogModal>
  )
}
