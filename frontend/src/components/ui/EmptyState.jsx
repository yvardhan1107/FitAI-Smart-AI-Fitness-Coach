export default function EmptyState({
  title = 'Nothing here yet',
  description,
  action,
  className = '',
}) {
  return (
    <div
      className={[
        'rounded-2xl border border-neutral-800 bg-neutral-900/50 px-6 py-10 text-center',
        className,
      ].join(' ')}
    >
      <p className="text-neutral-300 font-semibold">{title}</p>
      {description ? <p className="mt-2 text-sm text-neutral-400">{description}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

