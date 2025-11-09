import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import products from '../data/products';
import './Navigation.css';

const getLinkClassName = ({ isActive }) =>
  `nav-link${isActive ? ' nav-link--active' : ''}`;

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

function Navigation() {
  const location = useLocation();
  const productSlugs = useMemo(() => new Set(products.map((product) => product.slug)), []);
  const MOBILE_BREAKPOINT = 768;
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );

  useIsomorphicLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentSlug = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    return segments[0] ?? '';
  }, [location.pathname]);

  const isProductRoute = productSlugs.has(currentSlug);
  const shouldCollapse = isProductRoute && isMobile;

  const [isNavOpen, setIsNavOpen] = useState(() => !shouldCollapse);

  useEffect(() => {
    setIsNavOpen((prev) => {
      const desired = !shouldCollapse;
      return prev === desired ? prev : desired;
    });
  }, [shouldCollapse, currentSlug]);

  const navBarClassName = `nav-bar${shouldCollapse ? ' nav-bar--mobile-collapsed' : ''}`;
  const navLinksClassName = [
    'nav-links',
    shouldCollapse ? 'nav-links--collapsible' : '',
    shouldCollapse && isNavOpen ? 'nav-links--expanded' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={navBarClassName}>
      <div className="nav-leading">
        <NavLink to="/" className="nav-brand">
          Material Impact Explorer
        </NavLink>
        {shouldCollapse ? (
          <button
            type="button"
            className="nav-toggle"
            onClick={() => setIsNavOpen((prev) => !prev)}
            aria-label={isNavOpen ? 'Hide navigation' : 'Show navigation'}
            aria-expanded={isNavOpen}
          >
            <span className="nav-toggle__indicator" aria-hidden="true">
              {isNavOpen ? '-' : '+'}
            </span>
            <span className="nav-toggle__label">{isNavOpen ? 'Close' : 'Menu'}</span>
          </button>
        ) : null}
      </div>
      <nav className={navLinksClassName}>
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

