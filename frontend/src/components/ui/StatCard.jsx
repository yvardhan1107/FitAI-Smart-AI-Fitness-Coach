import Card from './Card';

export default function StatCard({ label, value, subtext, className = '', tone = 'neutral' }) {
  const toneClass =
    tone === 'success'
      ? 'border-emerald-500/30 bg-emerald-500/10'
      : tone === 'warning'
      ? 'border-amber-500/30 bg-amber-500/10'
      : tone === 'danger'
      ? 'border-red-500/30 bg-red-500/10'
      : 'border-neutral-800 bg-neutral-900/70';

  return (
    <Card className={['p-5', toneClass, className].join(' ')}>
      {label ? <p className="text-xs uppercase tracking-wide text-neutral-400">{label}</p> : null}
      <div className="mt-2">
        {value !== undefined && value !== null ? (
          <p className="text-3xl font-bold">{value}</p>
        ) : (
          <p className="text-3xl font-bold text-neutral-500">—</p>
        )}
      </div>
      {subtext ? <p className="text-xs text-neutral-400 mt-1">{subtext}</p> : null}
    </Card>
  );
}

