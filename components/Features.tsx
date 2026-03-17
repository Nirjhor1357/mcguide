export default function Features() {
  const features = [
    {
      title: "Stronghold Finder",
      desc: "Locate strongholds quickly using smart tools.",
    },
    {
      title: "Strategy Guides",
      desc: "Step-by-step guides for all skill levels.",
    },
    {
      title: "Speedrun Tips",
      desc: "Optimize your gameplay and improve speed.",
    },
  ]

  return (
    <section className="py-20 px-6 max-w-6xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        Everything You Need
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
          >
            <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
            <p className="text-gray-400">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}