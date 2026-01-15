import React, { useState } from 'react'
import { InboxOutlined } from '@ant-design/icons'
import { Upload, Image, message } from 'antd'
import type { UploadFile, UploadProps } from 'antd'

const { Dragger } = Upload

const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
    })

const UploadCombined: React.FC = () => {
    const [fileList, setFileList] = useState<UploadFile[]>([])
    const [previewOpen, setPreviewOpen] = useState(false)
    const [previewImage, setPreviewImage] = useState('')

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as File)
        }
        setPreviewImage(file.url || (file.preview as string))
        setPreviewOpen(true)
    }

    const handleChange: UploadProps['onChange'] = ({ file, fileList }) => {
        setFileList(fileList)

        if (file.status === 'done') {
            message.success(`${file.name} uploaded successfully`)
        }
        if (file.status === 'error') {
            message.error(`${file.name} upload failed`)
        }
    }

    return (
        <>
            {/* 1️⃣ Drag upload – UI giống component số 1 */}
            <Dragger
                multiple
                fileList={fileList}
                beforeUpload={() => false}
                onChange={handleChange}
                onPreview={handlePreview}
                showUploadList={false} // ẩn list mặc định
            >
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                    Click or drag file to this area to upload
                </p>
            </Dragger>

            {/* 2️⃣ List file – dạng picture (component số 3) */}
            <Upload
                className='cursor-pointer [&_.ant-upload-list-item]:!   text-blue-700'
                listType="text"
                fileList={fileList}
                onPreview={handlePreview}
                showUploadList={{ showRemoveIcon: true }}
                onChange={({ fileList }) => setFileList(fileList)}
            />

            {/* 3️⃣ Preview ảnh – logic component số 2 */}
            <Image
                preview={{
                    visible: previewOpen,
                    onVisibleChange: setPreviewOpen,
                }}
                src={previewImage}
                style={{ display: 'none' }}
            />
        </>
    )
}

export default UploadCombined
