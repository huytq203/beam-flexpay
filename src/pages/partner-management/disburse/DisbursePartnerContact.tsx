import { PARTNER_TYPE } from '@constants/partnerOptions'
import PartnerContactComponent from '../components/PartnerContact'

function DisbursePartnerContact() {
  const TYPE: PARTNER_TYPE = 'DISBURSE'

  return (
    <PartnerContactComponent
      type={TYPE}
      key={TYPE}
    />
  )
}

export default DisbursePartnerContact
