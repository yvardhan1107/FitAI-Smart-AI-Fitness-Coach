export default function Skeleton({ className = '', variant = 'rect' }) {
  const base =
    variant === 'circle'
      ? 'rounded-full'
      : variant === 'pill'
      ? 'rounded-full'
      : 'rounded-xl';

  return <div className={['animate-pulse bg-neutral-800/60', base, className].join(' ')} />;
}

