import { CardComponent, ModalComponent, Table } from '@components/common'
import { useSVG } from '@hooks/useSVG'
import React from 'react'
import FormSearch from './components/FormSearch'
import PersonalConfirm from './components/PersonalConfirm'
import { Column } from './configs/ConfirmEKYC.column'
import useConfirmEKYC from './hooks/useConfirmEKYC'

const ConfirmEKYC = () => {
  const { dataEKYC } = useConfirmEKYC()
  const { svg } = useSVG()
  const columns = Column({ svg })
  console.log(dataEKYC)
  return (
    <div className='flex flex-col gap-3'>
      <CardComponent content={<FormSearch />} />
      <CardComponent content={<Table bordered size='small' scroll={{ x: 'max-content' }} columns={columns} dataSource={dataEKYC} />} />

      <ModalComponent
        onCancel={() => { }}
        onOk={() => { }}
        open={true}
        width='75%'
        modalText={<PersonalConfirm/>}
        />
    </div>
  )
}

export default ConfirmEKYC