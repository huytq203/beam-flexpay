import React, { useState } from 'react'
import { InboxOutlined } from '@ant-design/icons'
import { Upload, Image } from 'antd'
import type { UploadFile, UploadProps } from 'antd'
import { Control, FieldValues, Path } from 'react-hook-form'
import { FormField } from './FormField'

const { Dragger } = Upload

const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
    })

interface FormUploadCombinedProps<T extends FieldValues> {
    name: Path<T>
    control: Control<T>
    label?: string | React.ReactNode
    className?: string
    classNameLabel?: string
    multiple?: boolean
    maxCount?: number
    accept?: string
    disabled?: boolean
    dragText?: string
}

export function FormUploadCombined<T extends FieldValues>({
    name,
    control,
    label,
    className = 'col-span-6 flex flex-col',
    classNameLabel = 'font-medium',
    multiple = true,
    maxCount,
    accept,
    disabled = false,
    dragText = 'Click or drag file to this area to upload',
}: FormUploadCombinedProps<T>) {
    return (
        <FormField
            name={name}
            control={control}
            label={label}
            className={className}
            classNameLable={classNameLabel}
            render={(field) => (
                <UploadControl
                    value={field.value || []}
                    onChange={field.onChange}
                    multiple={multiple}
                    maxCount={maxCount}
                    accept={accept}
                    disabled={disabled}
                    dragText={dragText}
                />
            )}
        />
    )
}

interface UploadControlProps {
    value?: UploadFile[]
    onChange?: (fileList: UploadFile[]) => void
    multiple?: boolean
    maxCount?: number
    accept?: string
    disabled?: boolean
    dragText?: string
}

const UploadControl: React.FC<UploadControlProps> = ({
    value = [],
    onChange,
    multiple = true,
    maxCount,
    accept,
    disabled = false,
    dragText = 'Click or drag file to this area to upload',
}) => {
    const [previewOpen, setPreviewOpen] = useState(false)
    const [previewImage, setPreviewImage] = useState('')

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as File)
        }
        setPreviewImage(file.url || (file.preview as string))
        setPreviewOpen(true)
    }

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
        onChange?.(newFileList)
    }

    const handleRemove = (file: UploadFile) => {
        const newFileList = value.filter(item => item.uid !== file.uid)
        onChange?.(newFileList)
    }

    return (
        <>
            <Dragger
                multiple={multiple}
                maxCount={maxCount}
                accept={accept}
                disabled={disabled}
                fileList={value}
                beforeUpload={() => false}
                onChange={handleChange}
                onPreview={handlePreview}
                showUploadList={false}
            >
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                    {dragText}
                </p>
            </Dragger>

            <Upload
                className='cursor-pointer [&_.ant-upload-list-item]:text-blue-700!'
                listType="text"
                fileList={value}
                onPreview={handlePreview}
                onRemove={handleRemove}
                showUploadList={{ showRemoveIcon: !disabled }}
            />

            {previewImage && (
                <Image
                    preview={{
                        visible: previewOpen,
                        onVisibleChange: setPreviewOpen,
                    }}
                    src={previewImage}
                    style={{ display: 'none' }}
                />
            )}
        </>
    )
}

export { UploadControl }
export type { UploadFile }
export default FormUploadCombined
