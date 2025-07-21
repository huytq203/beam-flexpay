import { Form, FormInstance } from 'antd'

type Props<ApiArg> = {
  headerMenu: string | JSX.Element | JSX.Element[]
  onFinish: (values: ApiArg) => void
  form: FormInstance<ApiArg>
  cols?: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12'
}

const gridColsMap = {
  '1': 'grid-cols-1',
  '2': 'grid-cols-2',
  '3': 'grid-cols-3',
  '4': 'grid-cols-4',
  '5': 'grid-cols-5',
  '6': 'grid-cols-6',
  '7': 'grid-cols-7',
  '8': 'grid-cols-8',
  '9': 'grid-cols-9',
  '10': 'grid-cols-10',
  '11': 'grid-cols-11',
  '12': 'grid-cols-12'
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
      <div className={`grid ${gridColsMap[cols] || 'grid-cols-2'} gap-3 mt-3`}>{headerMenu}</div>
    </Form>
  )
}
