import { Routes, Route, useLocation } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ShowsPage } from './pages/ShowsPage';
import { ShowDetailPage } from './pages/ShowDetailPage';
import { ScreeningsPage } from './pages/ScreeningsPage';
import { TheatresPage } from './pages/TheatresPage';
import { TheatreShowsPage } from './pages/TheatreShowsPage';
import { SeatsPage } from './pages/SeatsPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { CancelBookingPage } from './pages/CancelBookingPage';

function App() {
  const location = useLocation();

  return (
    <div key={location.pathname} className="animate-[page-in_0.3s_ease-out]">
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/shows" element={<ShowsPage />} />
        <Route path="/shows/:showId" element={<ShowDetailPage />} />
        <Route path="/shows/:showId/theatres/:theatreId" element={<ScreeningsPage />} />
        <Route path="/theatres" element={<TheatresPage />} />
        <Route path="/theatres/:theatreId" element={<TheatreShowsPage />} />
        <Route path="/screenings/:screeningId/seats" element={<SeatsPage />} />
        <Route path="/screenings/:screeningId/confirmation" element={<ConfirmationPage />} />
        <Route path="/cancel" element={<CancelBookingPage />} />
      </Routes>
    </div>
  );
}

export default App;