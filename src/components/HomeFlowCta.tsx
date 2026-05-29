import { useNavigate } from 'react-router-dom'
import AppButton from './AppButton'

/** LP メインCTA（ヒーロー・中段で共通） */
export default function HomeFlowCta() {
  const navigate = useNavigate()

  return (
    <AppButton type="button" onClick={() => navigate('/tool/step1')}>
      リフィルを作ってみる →
    </AppButton>
  )
}
