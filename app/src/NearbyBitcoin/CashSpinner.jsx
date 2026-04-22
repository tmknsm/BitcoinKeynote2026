export default function CashSpinner({ size = 64 }) {
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg
        style={{ position: 'absolute', inset: 0, animation: 'nb-spin 1.4s linear infinite' }}
        viewBox="0 0 64 64"
      >
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i * 30 - 60) * (Math.PI / 180)
          const r = 26
          const cx = Math.round((32 + r * Math.cos(angle)) * 100) / 100
          const cy = Math.round((32 + r * Math.sin(angle)) * 100) / 100
          const dotSize = 3 + i * 1.5
          const opacity = 0.15 + i * 0.2125
          return <circle key={`a-${i}`} cx={cx} cy={cy} r={dotSize / 2} fill="currentColor" opacity={opacity} />
        })}
      </svg>
      <svg
        style={{ position: 'absolute', inset: 0, animation: 'nb-spin 1.4s linear infinite', animationDelay: '-0.7s' }}
        viewBox="0 0 64 64"
      >
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i * 30 + 120) * (Math.PI / 180)
          const r = 26
          const cx = Math.round((32 + r * Math.cos(angle)) * 100) / 100
          const cy = Math.round((32 + r * Math.sin(angle)) * 100) / 100
          const dotSize = 3 + i * 1.5
          const opacity = 0.15 + i * 0.2125
          return <circle key={`b-${i}`} cx={cx} cy={cy} r={dotSize / 2} fill="currentColor" opacity={opacity} />
        })}
      </svg>
    </div>
  )
}
