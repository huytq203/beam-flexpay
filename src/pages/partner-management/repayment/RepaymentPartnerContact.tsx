import { PARTNER_TYPE } from '@constants/partnerOptions'
import PartnerContactComponent from '../components/PartnerContact'

function RepaymentPartnerContact() {
  const TYPE: PARTNER_TYPE = 'REPAYMENT'

  return (
    <PartnerContactComponent
      type={TYPE}
      key={TYPE}
    />
  )
}

export default RepaymentPartnerContact
