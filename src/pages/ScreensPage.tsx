import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Screen } from '../types/types';
import { fetchScreens } from '../api/screens';

export function ScreensPage() {
  const { theaterId } = useParams<{ theaterId: string }>();
  const [screens, setScreens] = useState<Screen[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!theaterId) return;
    fetchScreens(theaterId).then((data) => {
      setScreens(data);
      setIsLoading(false);
    });
  }, [theaterId]);

  if (isLoading) return <p className="p-6 text-dust">Loading screens...</p>;

  return (
    <div className="mx-auto max-w-xl p-6">
      <Link
        to="/theatres"
        className="inline-flex items-center gap-1 font-mono text-xs tracking-wide text-dust transition-colors hover:text-marquee-gold"
      >
        ← Back to theatres
      </Link>

      <p className="mt-4 mb-1 font-mono text-xs tracking-[0.3em] text-dust">STEP 2 OF 3</p>
      <h1 className="mb-6 font-display text-4xl tracking-wide text-ivory">Screens</h1>

      <div className="flex flex-col gap-4">
        {screens.map((screen) => (
          <Link
            key={screen.id}
            to={`/theatres/${theaterId}/screens/${screen.id}`}
            className="group relative flex items-center justify-between overflow-hidden rounded-lg border border-velvet-800 bg-velvet-900 transition-colors hover:border-marquee-gold-dim hover:bg-velvet-800"
          >
            <div className="flex-1 px-5 py-4 font-display text-2xl tracking-wide text-ivory">
              {screen.name}
            </div>

            <div className="relative flex h-full items-center px-5">
              <span aria-hidden className="absolute inset-y-0 left-0 border-l-2 border-dashed border-velvet-700" />
              <span className="font-display text-xl text-marquee-gold transition-transform group-hover:translate-x-1">→</span>
              <span aria-hidden className="absolute -top-2 left-0 h-4 w-4 -translate-x-1/2 rounded-full bg-velvet-950" />
              <span aria-hidden className="absolute -bottom-2 left-0 h-4 w-4 -translate-x-1/2 rounded-full bg-velvet-950" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}