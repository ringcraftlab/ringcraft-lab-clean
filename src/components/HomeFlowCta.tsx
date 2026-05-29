import { Link } from 'react-router-dom'

/** LP メインCTA（ヒーロー・中段で共通） */
export default function HomeFlowCta() {
  return (
    <Link to="/tool" className="home-flow__cta">
      <span className="home-flow__cta-label">リフィルを作ってみる</span>
      <span className="home-flow__cta-icon" aria-hidden>
        ›
      </span>
    </Link>
  )
}
