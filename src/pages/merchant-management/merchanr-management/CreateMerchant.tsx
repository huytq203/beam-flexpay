import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormInput, FormSelect, FormDatePicker, FormTextArea } from '@components/form'
import { ButtonComponent, CardComponent } from '@components/index'
import { ArrowLeftOutlined, EditOutlined, UserOutlined, ApartmentOutlined, InfoCircleOutlined, FileDoneOutlined } from '@components/icons'
import { CreateMerchantPayload } from '@type/merchant'
import { CreateMerchantSchema, CreateMerchantSchemaType } from './schemas/Merchant.schema'
import useHandle from './hooks/useHandle'
import { useNavigate, useParams } from 'react-router-dom'
import { useGetMerchantByIdQuery } from '@services/apiMerchant'

// Các trường mở rộng — chờ backend bổ sung, giữ lại trong form (hidden).
// Các trường đính kèm file chưa có control upload nào ghi vào, nên kiểu thực tế
// của chúng chưa xác định được từ code -> để `unknown`.
interface MerchantFormData extends CreateMerchantPayload {
  username?: string
  phoneNumber?: string
  merchantLogo?: unknown
  merchantName?: string
  merchantType?: string
  taxCode?: string
  businessType?: string
  businessEmail?: string
  adminEmail?: string
  address?: string
  fullName?: string
  position?: string
  idNumber?: string
  issueDate?: string
  issuePlace?: string
  businessLicense?: unknown
  idCardCCCD?: unknown
  registrationCertificate?: unknown
}

const CreateMerchant = () => {
  const navigate = useNavigate()
  const { id: merchantId } = useParams<{ id: string }>()
  const isEditMode = Boolean(merchantId)

  const { handleCreateMerchant, isLoadingPostMerchant, handlePutMerchant, isLoadingPutMerchant } = useHandle()
  const { data: merchantDetail } = useGetMerchantByIdQuery(merchantId ?? '', { skip: !merchantId })

  // Form giữ cả các field hidden (MerchantFormData), nhưng resolver chỉ validate
  // phần schema nên giá trị sau submit là CreateMerchantSchemaType.
  const { control, handleSubmit, reset } = useForm<MerchantFormData>({
    resolver: zodResolver(CreateMerchantSchema),
  })

  useEffect(() => {
    if (isEditMode && merchantDetail) {
      reset({
        name: merchantDetail.name ?? '',
        code: merchantDetail.code ?? '',
        contactEmail: merchantDetail.contactEmail ?? '',
        contactPhone: merchantDetail.contactPhone ?? '',
      })
    }
  }, [merchantDetail, isEditMode, reset])

  const merchantTypeOptions = [
    { label: 'Doanh nghiệp', value: 'business' },
    { label: 'Hộ kinh doanh', value: 'household' },
  ]

  const businessTypeOptions = [
    { label: 'F&B (Ăn uống)', value: 'fnb' },
    { label: 'Thời trang', value: 'fashion' },
    { label: 'Điện tử', value: 'electronics' },
  ]

  const positionOptions = [
    { label: 'Giám đốc', value: 'director' },
    { label: 'Chủ hộ', value: 'owner' },
  ]

  const onSubmit = (data: CreateMerchantSchemaType) => {
    if (isEditMode && merchantId) {
      handlePutMerchant(
        merchantId,
        { name: data.name, contactEmail: data.contactEmail, contactPhone: data.contactPhone },
        () => navigate(-1)
      )
    } else {
      handleCreateMerchant(data, () => reset())
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ButtonComponent icon={<ArrowLeftOutlined />} content="Quay lại" type="default" onClick={() => navigate(-1)} />
        </div>
        <div className="flex gap-3">
          <ButtonComponent
            type="primary"
            content={isEditMode ? 'Cập nhật merchant' : 'Xác nhận & Tạo merchant'}
            loading={isEditMode ? isLoadingPutMerchant : isLoadingPostMerchant}
            onClick={handleSubmit(onSubmit)}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardComponent className="mb-6">
          <div className="mb-4 flex items-center gap-2">
            <EditOutlined className="text-blue text-lg" />
            <h2 className="text-lg font-semibold text-blue">I. Thông tin merchant</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              control={control}
              name="name"
              label={<span>Tên merchant <span className="text-red-500">*</span></span>}
              placeholder="Nhập tên merchant"
            />
            <FormInput
              control={control}
              name="code"
              label={<span>Mã merchant <span className="text-red-500">*</span></span>}
              placeholder="Nhập mã merchant"
              disabled={isEditMode}
            />
            <FormInput
              control={control}
              name="contactEmail"
              label={<span>Email liên hệ <span className="text-red-500">*</span></span>}
              placeholder="Nhập email liên hệ"
            />
            <FormInput
              control={control}
              name="contactPhone"
              label={<span>Số điện thoại liên hệ <span className="text-red-500">*</span></span>}
              placeholder="Nhập số điện thoại liên hệ"
            />
          </div>
        </CardComponent>

        <div className="hidden">

          <CardComponent className="mb-6">
            <div className="mb-4 flex items-center gap-2">
              <EditOutlined className="text-blue text-lg" />
              <h2 className="text-lg font-semibold text-blue">I. Thông tin tài khoản đăng nhập</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormInput
                  control={control}
                  name="username"
                  label={<span>Email đăng ký (Username) <span className="text-red-500">*</span></span>}
                  placeholder="Email nhân đăng ký mã khẩu"
                />
                <div className="mt-2 flex justify-start items-center gap-2">
                  <InfoCircleOutlined className="text-gray-400 text-[14px]" />
                  <span className="text-[12px] text-gray-500">
                    Mật khẩu sẽ được hệ thống tự động tạo và gửi về Email sau khi hoàn tất
                  </span>
                </div>
              </div>
              <div>
                <FormInput
                  control={control}
                  name="phoneNumber"
                  label={<span>Số điện thoại đăng ký <span className="text-red-500">*</span></span>}
                  placeholder="Số điện thoại chính"
                />
              </div>
            </div>
          </CardComponent>

          <CardComponent className="mb-6">
            <div className="mb-4 flex items-center gap-2">
              <ApartmentOutlined className="text-blue text-lg" />
              <h2 className="text-lg font-semibold text-blue">II. Định danh doanh nghiệp / Hộ kinh doanh</h2>
            </div>

            <div className="space-y-4">
              <div>
                <div className="mb-2">
                  <span className="font-medium">Logo Merchant</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    <div className="cursor-pointer text-center">
                      <div className="text-2xl text-gray-400">📷</div>
                    </div>
                  </div>
                  <ButtonComponent type="default" content="Tải Logo lên" size="small" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  control={control}
                  name="merchantName"
                  label={<span>Tên Merchant <span className="text-red-500">*</span></span>}
                  placeholder="Tên thương hiệu/Hộ Bà"
                />
                <FormSelect
                  control={control}
                  name="merchantType"
                  label={<span>Loại Merchant <span className="text-red-500">*</span></span>}
                  placeholder="Doanh nghiệp"
                  options={merchantTypeOptions}
                />
                <FormInput
                  control={control}
                  name="taxCode"
                  label={<span>Mã số thuế <span className="text-red-500">*</span></span>}
                  placeholder="Mã số thuế hoặc Mã số DN"
                />
                <FormSelect
                  control={control}
                  name="businessType"
                  label={<span>Loại hình kinh doanh <span className="text-red-500">*</span></span>}
                  placeholder="F&B (Ăn uống)"
                  options={businessTypeOptions}
                />
                <FormInput
                  control={control}
                  name="businessEmail"
                  label={<span>Email nhận đối soát <span className="text-red-500">*</span></span>}
                  placeholder="Email nhận đối soát doanh thu"
                />
                <FormInput
                  control={control}
                  name="adminEmail"
                  label={<span>Email nhận hóa đơn <span className="text-red-500">*</span></span>}
                  placeholder="Email nhận hóa đơn điện tử"
                />
              </div>

              <FormTextArea
                control={control}
                name="address"
                label={<span>Địa chỉ trụ sở <span className="text-red-500">*</span></span>}
                placeholder="Địa chỉ chính xác theo GPKD"
                rows={3}
              />
            </div>
          </CardComponent>

          <CardComponent className="mb-6">
            <div className="mb-4 flex items-center gap-2">
              <UserOutlined className="text-blue text-lg" />
              <h2 className="text-lg font-semibold text-blue">III. Thông tin người đại diện</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                control={control}
                name="fullName"
                label={<span>Họ và tên <span className="text-red-500">*</span></span>}
                placeholder="Tên người đại diện pháp luật"
              />
              <FormSelect
                control={control}
                name="position"
                label={<span>Chức vụ <span className="text-red-500">*</span></span>}
                placeholder="Vị dụ: Giám đốc, Chủ hộ"
                options={positionOptions}
              />
              <FormInput
                control={control}
                name="idNumber"
                label={<span>Số CCCD <span className="text-red-500">*</span></span>}
                placeholder="Nhập 12 số CCCD"
              />
              <FormDatePicker
                control={control}
                name="issueDate"
                label={<span>Ngày hết hạn CCCD <span className="text-red-500">*</span></span>}
                placeholder="dd / mm / yyyy"
              />
              <FormInput
                control={control}
                name="issuePlace"
                label={<span>SĐT nhân viên OTP <span className="text-red-500">*</span></span>}
                placeholder="Số tuyệt hiện giúp dịch"
              />
            </div>
          </CardComponent>

          <CardComponent className="mb-6">
            <div className="mb-4 flex items-center gap-2">
              <FileDoneOutlined className="text-blue text-lg" />
              <h2 className="text-lg font-semibold text-blue">IV. Hồ sơ pháp lý đính kèm</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="mb-2">
                  <span className="font-medium">Đăng ký kinh doanh <span className="text-red-500">*</span></span>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition">
                  <div className="text-4xl mb-2">📄</div>
                  <div className="text-sm text-blue">Tải file lên</div>
                </div>
              </div>
              <div className="text-center">
                <div className="mb-2">
                  <span className="font-medium">Ảnh CCCD (2 mặt) <span className="text-red-500">*</span></span>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition">
                  <div className="text-4xl mb-2">📄</div>
                  <div className="text-sm text-blue">Tải file lên</div>
                </div>
              </div>
              <div className="text-center">
                <div className="mb-2">
                  <span className="font-medium">Hợp đồng Merchant <span className="text-red-500">*</span></span>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition">
                  <div className="text-4xl mb-2">📄</div>
                  <div className="text-sm text-blue">Tải file lên</div>
                </div>
              </div>
            </div>
          </CardComponent>

        </div>

      </form>
    </div>
  )
}

export default CreateMerchant