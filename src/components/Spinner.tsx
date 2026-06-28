export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-[3px]',
  }[size];

  return (
    <div
      className={`animate-spin rounded-full border-velvet-700 border-t-marquee-gold ${sizeClass}`}
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[40vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <span className="font-mono text-[10px] tracking-[0.3em] text-dust animate-pulse">
          LOADING
        </span>
      </div>
    </div>
  );
}