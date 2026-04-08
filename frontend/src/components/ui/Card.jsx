export default function Card({ children, className = '', variant = 'glass-dark', ...rest }) {
  const variantClass = variant === 'glass' ? 'glass' : variant === 'glass-dark' ? 'glass-dark' : '';

  return (
    <div
      className={[
        'rounded-2xl border border-neutral-800/70 bg-neutral-900/60',
        variantClass,
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
}

