export default function Heading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-8 max-w-xl md:mb-12">
      <h2 className="font-display text-[2rem] leading-[1.1] md:text-5xl">{title}</h2>
      <div className="hairline mt-5 w-24" />
      {sub && <p className="mt-5 text-[0.95rem] leading-relaxed text-mute">{sub}</p>}
    </div>
  )
}
