import { CardComponent } from '@components/common'
import { MailOutlined } from '@components/icons/common'

export const FormSendEmail = () => {
  return (
    <>
      <CardComponent
        content={
          <>
            <div className='flex justify-center items-center flex-col gap-5'>
              <div className='flex justify-center items-center'>
                <span className='w-12 h-12 bg-teal-100 text-teal-800 rounded-full flex justify-center items-center'>
                  <MailOutlined style={{ fontSize: '1.65rem' }} />
                </span>
              </div>
              <div className='flex justify-center items-center text-center'>
                <p>
                  Bạn có chắc chắn muốn gửi liên kết đạt lại mật khẩu cho tài
                  khoản <span className='font-bold'> Nguyễn A</span> không?
                </p>
              </div>
              <div className='flex justify-center items-center text-center border p-1 bg-gray-100 rounded-md'>
                <p>
                  Hệ thống sẽ gửi email hướng dẫn đến địa chỉ:{' '}
                  <span className='font-medium text-green-800'>
                    nguyena@domain.com
                  </span>
                </p>
              </div>
            </div>
          </>
        }
      />
    </>
  )
}

export default FormSendEmail
