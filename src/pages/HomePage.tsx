import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6 p-10 text-center">
      <h1 className="text-3xl font-bold text-gray-900">Mini BookMyShow</h1>
      <p className="text-gray-600">Pick a theatre, pick a screen, pick your seats.</p>
      <Link
        to="/theatres"
        className="rounded-md bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
      >
        View Theatres
      </Link>
    </div>
  );
}