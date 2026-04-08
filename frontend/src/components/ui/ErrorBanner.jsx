export default function ErrorBanner({ message, className = '' }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={['rounded-2xl border border-red-900/40 bg-red-900/15 px-5 py-4 text-red-200', className].join(
        ' '
      )}
    >
      <p className="text-sm">{message}</p>
    </div>
  );
}

