import { Link } from 'react-router-dom';
import './NotFound.css';

function NotFound() {
  return (
    <div className="not-found">
      <h1>Page not found</h1>
      <p>This exploration trail doesn’t exist yet. Let’s return to the collection.</p>
      <Link to="/" className="not-found__cta">
        Back to explorer
      </Link>
    </div>
  );
}

export default NotFound;

