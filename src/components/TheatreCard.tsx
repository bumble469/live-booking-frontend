import { Link } from 'react-router-dom';

interface TheatreCardProps {
  id: string;
  name: string;
  city: string;
  to: string;
  subtitle?: string;
}

export function TheatreCard({ id: _id, name, city, to, subtitle }: TheatreCardProps) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between overflow-hidden rounded-lg border border-velvet-800 bg-velvet-900 transition-all hover:border-marquee-gold-dim hover:bg-velvet-800"
    >
      <div className="w-1 self-stretch bg-velvet-700 transition-colors group-hover:bg-marquee-gold-dim" />

      <div className="flex flex-1 items-center gap-4 px-5 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-velvet-700 bg-velvet-800 font-display text-xl text-marquee-gold">
          ◈
        </div>
        <div className="flex flex-1 flex-col min-w-0">
          <span className="font-display text-xl tracking-wide text-ivory truncate">{name}</span>
          <span className="font-mono text-xs text-dust">
            {city}{subtitle ? ` · ${subtitle}` : ''}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden rounded border border-velvet-700 px-2 py-0.5 font-mono text-[10px] text-dust sm:inline">
            View Shows
          </span>
          <span className="font-display text-lg text-marquee-gold transition-transform group-hover:translate-x-1">→</span>
        </div>
      </div>
    </Link>
  );
}