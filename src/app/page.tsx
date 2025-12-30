export default function Home() {
  return (
    <main style={{
        minHeight: "100vh",
        backgroundImage: `
          url("/pottery-pattern.png"),
          radial-gradient(circle at top left,
  #FFF4E6 0%,
  #EDD8B4 45%,
  #D2B48C 100%
      )
        `,
        backgroundRepeat: "repeat, no-repeat",
        backgroundSize: "220px 220px, cover",
        backgroundPosition: "center, center",
        backgroundBlendMode: "soft-light",
      }} className="space-y-40">

      {/* HERO */}
      <section className="min-h-[85vh] flex items-center justify-center text-center px-6">
        <div className="max-w-3xl">
          <h1 className="font-serif text-5xl md:text-7xl text-[#5a3e2b] leading-tight mb-6">
            Basho by Shivangi
          </h1>
          <p className="text-lg md:text-xl text-[#6d4c3d] mb-10">
            Japanese-inspired handcrafted pottery, soulful tableware & studio experiences.
          </p>
          <a href="#products" className="inline-block border border-[#5a3e2b] px-8 py-3 rounded-full hover:bg-[#5a3e2b] hover:text-white transition">
            Explore Collection
          </a>
        </div>
      </section>

      {/* STORY */}
      <section className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 px-6 items-center">
        <div>
          <h2 className="font-serif text-4xl mb-6">The Basho Philosophy</h2>
          <p className="leading-relaxed text-[#6d4c3d]">
            Inspired by Japanese wabi-sabi, Basho embraces raw beauty, earthy textures, and handcrafted pottery
            that brings calm, ritual, and mindfulness to everyday living.
          </p>
        </div>
        <div className="h-[300px] bg-[#e8d8c4] rounded-3xl"></div>
      </section>

      {/* PRODUCTS */}
      <section id="products" className="max-w-6xl mx-auto px-6">
        <h2 className="font-serif text-4xl text-center mb-12">Tableware Collections</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-3xl p-6 shadow-md text-center">
              <div className="h-48 bg-[#e8d8c4] rounded-xl mb-4"></div>
              <h3 className="font-serif text-xl">Ceramic Bowl</h3>
              <p className="text-sm text-[#6d4c3d]">Handcrafted stoneware bowl</p>
            </div>
          ))}
        </div>
      </section>

      {/* WORKSHOPS */}
      <section className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="font-serif text-4xl mb-12">Studio Workshops</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10">
          {[1,2,3].map(i => (
            <div key={i} className="border rounded-3xl p-8">
              <h3 className="font-serif text-xl mb-2">Pottery Experience</h3>
              <p className="text-sm text-[#6d4c3d]">Hands-on clay workshop</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-20 text-sm text-[#6d4c3d]">
        © {new Date().getFullYear()} Basho by Shivangi
      </footer>

    </main>
  );
}
