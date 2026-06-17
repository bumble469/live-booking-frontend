import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Theater } from '../types/types';
import { fetchTheaters } from '../api/theater';

export function TheatresPage() {
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTheaters().then((data) => {
      setTheaters(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return <p className="p-6">Loading theatres...</p>;

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-semibold text-gray-900">Theatres</h1>
      <div className="flex flex-col gap-3">
        {theaters.map((theater) => (
          <Link
            key={theater.id}
            to={`/theatres/${theater.id}`}
            className="rounded-md border border-gray-200 p-4 transition-colors hover:border-blue-400 hover:bg-blue-50"
          >
            <div className="font-semibold text-gray-900">{theater.name}</div>
            <div className="text-sm text-gray-500">{theater.city}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}