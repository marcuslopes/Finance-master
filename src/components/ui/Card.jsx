export default function Card({ children, className = '', onClick, ...props }) {
  const base = 'bg-white rounded-xl shadow-sm border border-gray-100'
  const interactive = onClick ? 'cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]' : ''
  return (
    <div className={`${base} ${interactive} ${className}`} onClick={onClick} {...props}>
      {children}
    </div>
  )
}
