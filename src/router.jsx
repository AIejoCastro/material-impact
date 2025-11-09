import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './shared/AppLayout';
import ProductPage from './views/ProductPage';
import LandingPage from './views/LandingPage';
import NotFound from './views/NotFound';
import products from './data/products';

const productRoutes = products.map((product) => ({
  path: product.slug,
  element: <ProductPage product={product} />
}));

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <LandingPage products={products} /> },
      ...productRoutes,
      { path: '*', element: <NotFound /> }
    ]
  }
]);

export default router;

