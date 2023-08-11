import { Card, InputNumber } from 'antd'

type props = {
  title: string
  color: string
  value: number
}

export default function CardNumber({ title, value, color }: props) {
  return (
    <Card
      title={<h3>{title}</h3>}
      className={`card-number border-top-${color}`}
    >
      <h2 className={`text-${color}`}>
        <InputNumber
          value={value || 0}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          }
          readOnly
          bordered={false}
          className='fs-25'
          style={{ minWidth: 200 }}
          // parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
        />
      </h2>
    </Card>
  )
}
