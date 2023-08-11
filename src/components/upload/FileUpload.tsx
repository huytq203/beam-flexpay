import { PlusOutlined } from '@ant-design/icons'
import { Modal } from 'antd'
import Upload, { RcFile, UploadFile, UploadProps } from 'antd/es/upload'
import { useEffect, useState } from 'react'

type props = {
  fileSelect: (file: UploadFile) => void
  preview?: string
}

const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })

export default function FileUpload(props: props) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [previewTitle, setPreviewTitle] = useState('')

  const [fileList, setFileList] = useState<UploadFile[]>([])

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile)
    }
    setPreviewImage(file.url || (file.preview as string))
    setPreviewOpen(true)
    setPreviewTitle(
      file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1)
    )
  }

  const handleCancel = () => setPreviewOpen(false)

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    props.fileSelect(fileList[fileList.length - 1])
    setFileList(newFileList)
  }

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  )

  const dummyRequest = ({ onSuccess }: any) => {
    setTimeout(() => {
      onSuccess('ok')
    }, 0)
  }

  useEffect(() => {
    if (props.preview) {
      setFileList([
        {
          uid: '-1',
          name: props.preview,
          status: 'done',
          url: import.meta.env.VITE_IMAGE_URL + props.preview
        }
      ])
    }
  }, [props.preview])

  return (
    <>
      <Upload
        listType='picture-card'
        fileList={fileList}
        onPreview={handlePreview}
        onChange={handleChange}
        customRequest={dummyRequest}
      >
        {fileList.length > 0 ? null : uploadButton}
      </Upload>
      <Modal
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={handleCancel}
      >
        <img
          alt='upload'
          style={{ width: '100%' }}
          src={previewImage}
        />
      </Modal>
    </>
  )
}
