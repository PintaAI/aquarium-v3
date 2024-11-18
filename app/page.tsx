import Hero from "../components/landing/hero";
import Fitur from "../components/landing/fitur";
import Testimoni from "../components/landing/testimoni";
import Cta from "../components/landing/cta";
import Navbar from "../components/navbar";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Fitur />
      <Testimoni />
      <Cta />
    </main>
  );
}
