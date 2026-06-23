import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ShowsPage } from './pages/ShowsPage';
import { ShowDetailPage } from './pages/ShowDetailPage';
import { ScreeningsPage } from './pages/ScreeningsPage';
import { TheatresPage } from './pages/TheatresPage';
import { TheatreShowsPage } from './pages/TheatreShowsPage';
import { SeatsPage } from './pages/SeatsPage';
import { ConfirmationPage } from './pages/ConfirmationPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      {/* Browse by show */}
      <Route path="/shows" element={<ShowsPage />} />
      <Route path="/shows/:showId" element={<ShowDetailPage />} />
      <Route path="/shows/:showId/theatres/:theatreId" element={<ScreeningsPage />} />

      {/* Browse by theatre */}
      <Route path="/theatres" element={<TheatresPage />} />
      <Route path="/theatres/:theatreId" element={<TheatreShowsPage />} />

      {/* Seat selection — screening-scoped */}
      <Route path="/screenings/:screeningId/seats" element={<SeatsPage />} />
      <Route path="/screenings/:screeningId/confirmation" element={<ConfirmationPage />} />
    </Routes>
  );
}

export default App;