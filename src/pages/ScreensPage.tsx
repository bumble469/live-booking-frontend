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

  if (isLoading) return <p className="p-6">Loading screens...</p>;

  return (
    <div className="mx-auto max-w-xl p-6">
      <Link to="/theatres" className="text-sm text-blue-600 hover:underline">
        ← Back to theatres
      </Link>
      <h1 className="mt-2 mb-4 text-2xl font-semibold text-gray-900">Screens</h1>
      <div className="flex flex-col gap-3">
        {screens.map((screen) => (
          <Link
            key={screen.id}
            to={`/theatres/${theaterId}/screens/${screen.id}`}
            className="rounded-md border border-gray-200 p-4 font-semibold text-gray-900 transition-colors hover:border-blue-400 hover:bg-blue-50"
          >
            {screen.name}
          </Link>
        ))}
      </div>
    </div>
  );
}