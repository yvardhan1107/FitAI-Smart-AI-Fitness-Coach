export default function Avatar({ name, initials, className = '' }) {
  const text = initials
    ? String(initials)
    : name
        ? String(name)
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join('')
        : '';

  const firstLetter = text ? text[0] : '';

  return (
    <div
      className={[
        'h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-black select-none',
        className,
      ].join(' ')}
      aria-label={name ? `Avatar for ${name}` : 'Avatar'}
    >
      {firstLetter || 'A'}
    </div>
  );
}

