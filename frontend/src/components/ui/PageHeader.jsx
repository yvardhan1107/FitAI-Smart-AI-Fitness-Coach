import { Link } from 'react-router-dom';

export default function PageHeader({
  title,
  subtitle,
  right,
  backLink,
  backLabel = 'Back',
  className = '',
}) {
  return (
    <header className={['rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6', className].join(' ')}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-[240px]">
          <h1 className="text-3xl font-bold">{title}</h1>
          {subtitle ? <p className="mt-2 text-neutral-400">{subtitle}</p> : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-end">
          {backLink ? (
            <Link
              to={backLink}
              className="rounded-lg bg-neutral-800 hover:bg-neutral-700 px-4 py-2 text-sm"
            >
              {backLabel}
            </Link>
          ) : null}
          {right}
        </div>
      </div>
    </header>
  );
}

