import { useParams } from 'react-router-dom'
import { WalletLimitFormEditLoader } from '../components/WalletLimitFormEditLoader'
import { WalletLimitFormView } from '../components/WalletLimitFormView'

/** Một form cho cả `/create` và `/:id/edit`. */
const WalletLimitFormPage = () => {
  const { id } = useParams()
  return id ? <WalletLimitFormEditLoader id={id} /> : <WalletLimitFormView />
}

export default WalletLimitFormPage
