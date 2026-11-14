interface NewPostsPillProps {
  count: number;
  onClick: () => void;
}

export default function NewPostsPill({ count, onClick }: NewPostsPillProps) {
  if (count === 0) return null;

  return (
    <button
      onClick={onClick}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 button-2008 text-white px-4 py-2 text-sm font-medium shadow-lg hover:shadow-xl transition-shadow"
      aria-label={`${count} new post${count !== 1 ? 's' : ''}, scroll to top`}
    >
      ↑ {count} new post{count !== 1 ? 's' : ''}
    </button>
  );
}
