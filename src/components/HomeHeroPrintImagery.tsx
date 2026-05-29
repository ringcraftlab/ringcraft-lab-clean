const base = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`
const sampleImagesSrc = `${base}SampleNoHoll.png`

/** トップ：作り方のイメージ（8枚配置のA4作例・見出し・説明なし） */
export default function HomeHeroPrintImagery() {
  return (
    <section className="home-hero-samples home-hero-samples--visual-only" aria-label="作り方のイメージ">
      <figure className="home-hero-samples__figure">
        <img
          src={sampleImagesSrc}
          alt="A4用紙に8枚の写真をリフィル枠に配置した印刷イメージ"
          loading="eager"
          decoding="async"
        />
      </figure>
    </section>
  )
}
