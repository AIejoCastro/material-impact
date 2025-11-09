import { NavLink } from 'react-router-dom';
import products from '../data/products';
import './Navigation.css';

const getLinkClassName = ({ isActive }) =>
  `nav-link${isActive ? ' nav-link--active' : ''}`;

function Navigation() {
  return (
    <header className="nav-bar">
      <NavLink to="/" className="nav-brand">
        Material Impact Explorer
      </NavLink>
      <nav className="nav-links">
        {products.map((product) => (
          <NavLink key={product.slug} to={`/${product.slug}`} className={getLinkClassName}>
            {product.name}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}

export default Navigation;

