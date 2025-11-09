import { Outlet } from 'react-router-dom';
import Navigation from '../ui/Navigation';
import BackgroundCanvas from '../ui/BackgroundCanvas';
import '../styles/layout.css';

function AppLayout() {
  return (
    <div className="app-shell">
      <BackgroundCanvas />
      <Navigation />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;

