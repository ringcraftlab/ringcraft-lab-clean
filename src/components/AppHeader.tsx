import { Link } from 'react-router-dom'
import { AppHeaderBrandIcon } from './AppHeaderBrandIcon'

export interface AppHeaderProps {
  backTo: string
  /** Desktop / wide: full label e.g. 「← リフィル作成に戻る」 */
  backLabel: string
  title?: string
  backState?: object
}

export default function AppHeader({
  backTo,
  backLabel,
  title = 'リフィル作成',
  backState,
}: AppHeaderProps) {
  return (
    <header className="wizard-header app-header">
      <div className="wizard-header__inner app-header__inner">
        <Link
          to={backTo}
          state={backState}
          className="wizard-header__back app-header__back"
        >
          <span className="app-header__back-label app-header__back-label--full">{backLabel}</span>
          <span className="app-header__back-label app-header__back-label--short">← 戻る</span>
        </Link>
        <h1 className="wizard-header__title app-header__title">
          <AppHeaderBrandIcon />
          <span className="app-header__title-text">{title}</span>
        </h1>
      </div>
    </header>
  )
}
