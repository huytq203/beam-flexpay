import { useOutboundFeeLockMutation } from '@services/outboundFeeService'
import { OutboundFeeType } from '@type/outbound-fee'
import { DatePicker, Form, message, Modal } from 'antd'
import dayjs from 'dayjs'

interface OutboundFeeLockModalProps {
  open: boolean
  outboundFee: OutboundFeeType | null
  onClose: () => void
}

const OutboundFeeLockModal = ({
  open,
  outboundFee,
  onClose
}: OutboundFeeLockModalProps) => {
  const [form] = Form.useForm()
  const [lockOutboundFee, { isLoading }] = useOutboundFeeLockMutation()

  const handleLock = async () => {
    if (!outboundFee?.id) return

    try {
      // Validate form fields
      const values = await form.validateFields()

      // Convert Day.js to ISO 8601 UTC string
      const lockTime = values.lockTime.toISOString()

      await lockOutboundFee({
        id: outboundFee.id,
        lockTime
      }).unwrap()

      message.success('Khoá phí thành công!')
      form.resetFields()
      onClose()
    } catch (error: any) {
      // Check if it's form validation error
      if (error.errorFields) {
        // Form validation error, do nothing (error messages already shown)
        return
      }

      console.error('Error locking outbound fee:', error)

      const errorMessage = error?.data?.message || error?.message || 'Có lỗi xảy ra khi khoá phí'

      if (errorMessage.includes('OUTBOUND_FEE_CANNOT_LOCK')) {
        message.error('Không thể khoá phí ở trạng thái hiện tại. Chỉ có thể khoá phí đang áp dụng hoặc đã duyệt.')
      } else if (errorMessage.includes('OUTBOUND_FEE_LOCK_TIME_MUST_BE_FUTURE')) {
        message.error('Thời gian khoá phải lớn hơn thời gian hiện tại.')
      } else {
        message.error(errorMessage)
      }
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onClose()
  }

  return (
    <Modal
      title="Khoá phí đầu ra"
      open={open}
      onOk={handleLock}
      onCancel={handleCancel}
      okText="Xác nhận khoá"
      cancelText="Hủy"
      confirmLoading={isLoading}
      width={500}
      destroyOnClose
      okButtonProps={{
        type: 'primary',
        disabled: !outboundFee
      }}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="lockTime"
          label="Thời gian khoá"
          rules={[
            {
              required: true,
              message: 'Vui lòng chọn thời gian khoá'
            },
            {
              validator: (_, value) => {
                if (!value) return Promise.reject()

                const now = new Date()
                const lockTime = value.$d || value._d || new Date(value)

                if (lockTime <= now) {
                  return Promise.reject('Thời gian khoá phải lớn hơn hoặc bằng thời gian hiện tại')
                }
                return Promise.resolve()
              }
            }
          ]}
        >
          <DatePicker
            showTime
            format="DD/MM/YYYY HH:mm:ss"
            placeholder="Chọn thời gian khoá"
            className="w-full"
            size="large"
            disabledDate={(current) => {
              // Disable all past dates
              return current && current < dayjs().startOf('day')
            }}
            disabledTime={(current) => {
              if (!current) return {}

              const now = dayjs()
              const selectedDate = dayjs(current)

              // If selected date is today, disable past hours/minutes/seconds
              if (selectedDate.isSame(now, 'day')) {
                return {
                  disabledHours: () => {
                    const hours = []
                    for (let i = 0; i < now.hour(); i++) {
                      hours.push(i)
                    }
                    return hours
                  },
                  disabledMinutes: (selectedHour: number) => {
                    if (selectedHour === now.hour()) {
                      const minutes = []
                      for (let i = 0; i <= now.minute(); i++) {
                        minutes.push(i)
                      }
                      return minutes
                    }
                    return []
                  },
                  disabledSeconds: (selectedHour: number, selectedMinute: number) => {
                    if (selectedHour === now.hour() && selectedMinute === now.minute()) {
                      const seconds = []
                      for (let i = 0; i <= now.second(); i++) {
                        seconds.push(i)
                      }
                      return seconds
                    }
                    return []
                  }
                }
              }

              return {}
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default OutboundFeeLockModal
