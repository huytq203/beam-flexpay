import { Form, FormInstance } from 'antd'

type Props<ApiArg> = {
  headerMenu: string | JSX.Element | JSX.Element[]
  onFinish: (values: ApiArg) => void
  form: FormInstance<ApiArg>
  cols?: string
}

export default function SearchBar<ApiArg extends object>({
  headerMenu,
  form,
  onFinish,
  cols = '2'
}: Props<ApiArg>) {
  return (
    <Form
      layout='vertical'
      onFinish={onFinish}
      form={form}
      initialValues={{
        active: null
      }}
    >
      <div className={`grid grid-cols-${cols} gap-3`}>{headerMenu}</div>
    </Form>
  )
}
