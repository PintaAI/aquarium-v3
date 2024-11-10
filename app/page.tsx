import Hero from "./landing/hero"
import Fitur from "./landing/fitur"
import Testimoni from "./landing/testimoni"
import CTA from "./landing/cta"

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Fitur />
      <Testimoni />
      <CTA />
    </main>
  )
}
