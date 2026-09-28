import { Image } from 'antd'
import type { ImageProps } from 'antd'

export type ImageComponentProps = ImageProps

/** Ảnh có xem phóng to của antd; bọc lại để trang không import antd trực tiếp. */
const ImageComponent = (props: ImageComponentProps) => <Image {...props} />

export default ImageComponent
