import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { TheatresPage } from './pages/TheatresPage';
import { ScreensPage } from './pages/ScreensPage';
import { SeatsPage } from './pages/SeatsPage';
import { ConfirmationPage } from './pages/ConfirmationPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/theatres" element={<TheatresPage />} />
      <Route path="/theatres/:theaterId" element={<ScreensPage />} />
      <Route path="/theatres/:theaterId/screens/:screenId" element={<SeatsPage />} />
      <Route
        path="/theatres/:theaterId/screens/:screenId/confirmation"
        element={<ConfirmationPage />}
      />
    </Routes>
  );
}

export default App;