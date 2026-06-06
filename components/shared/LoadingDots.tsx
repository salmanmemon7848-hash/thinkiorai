export default function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <span key={i} className="loading-dot w-1.5 h-1.5 rounded-full bg-accent" />
      ))}
    </div>
  )
}
