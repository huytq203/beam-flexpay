import { PlusOutlined } from '@ant-design/icons'
import { hideLoading, showLoading } from '@utils/events'
import { Modal, Upload, message } from 'antd'
import type { RcFile, UploadProps } from 'antd/es/upload'
import type { UploadChangeParam, UploadFile } from 'antd/es/upload/interface'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Trash } from '@phosphor-icons/react'
import './style.scss'

const getBase64 = (img: RcFile, callback: (url: string) => void) => {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result as string))
  reader.readAsDataURL(img)
}

type ImageUploadProps = {
  files: UploadFile[]
  setFiles: (files: UploadFile[]) => void
  imgUrl: string
  setImgUrl: React.Dispatch<React.SetStateAction<string>>
}

const ImageUpload: React.FC<ImageUploadProps> = (props: ImageUploadProps) => {
  const { files, setFiles, imgUrl, setImgUrl } = props
  const { t } = useTranslation()
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [previewTitle, setPreviewTitle] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (loading) {
      showLoading()
    } else {
      hideLoading()
    }
  }, [loading])

  const handleCancel = () => setPreviewOpen(false)

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng =
      file.type === 'image/jpeg' ||
      file.type === 'image/png' ||
      file.type === 'image/jpg'
    if (!isJpgOrPng) {
      message.error(t('messages.errorMessage.fileType').toString())
    }
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      message.error(t('messages.errorMessage.file5mb').toString())
    }
    return isJpgOrPng && isLt5M
  }

  const handleChange: UploadProps['onChange'] = (
    info: UploadChangeParam<UploadFile>
  ) => {
    if (info.file.status === 'uploading') {
      setLoading(true)
      return
    }
    if (info.file.status === 'done') {
      getBase64(info.file.originFileObj as RcFile, (url) => {
        setLoading(false)
        setImgUrl(url)
        setFiles(info.file as any)
      })
    }
  }

  const handlePreview = async (file: UploadFile) => {
    setPreviewImage(file.url || (file.preview as string))
    setPreviewOpen(true)
    setPreviewTitle(
      file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1)
    )
  }

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  )

  const dummyRequest = ({ file, onSuccess }: any) => {
    setTimeout(() => {
      onSuccess('ok')
    }, 0)
  }

  return (
    <>
      <Upload
        listType='picture-card'
        onPreview={handlePreview}
        showUploadList={false}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        accept='image/*'
        progress={{ strokeWidth: 2 }}
        customRequest={dummyRequest}
        style={{ width: '100%' }}
      >
        {imgUrl ? (
          <img
            src={imgUrl}
            alt='avatar'
            style={{ width: '100%' }}
          />
        ) : (
          uploadButton
        )}
      </Upload>
      {files && imgUrl ? (
        <div style={{ width: '100%', textAlign: 'center', cursor: 'pointer' }}>
          <Trash
            color='red'
            onClick={() => {
              setImgUrl('')
              setFiles([])
            }}
          />
        </div>
      ) : null}
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
        centered
        className='modal-preview'
      >
        <img
          alt='product'
          className='w-100'
          src={previewImage}
        />
      </Modal>
    </>
  )
}

export default ImageUpload
