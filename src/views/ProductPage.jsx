import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductCanvas from '../components/ProductCanvas';
import './ProductPage.css';

const containerVariants = {
  hidden: { opacity: 0, y: 60 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      ease: 'easeOut',
      duration: 0.9
    }
  }
};

function ProductPage({ product }) {
  return (
    <section className="product" style={{ '--hero-color': product.palette.primary }}>
      <motion.div className="product-hero" initial="hidden" animate="show" variants={containerVariants}>
        <div className="product-hero__copy">
          <p className="product-hero__category">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="product-hero__headline">{product.headline}</p>
          <div className="product-hero__stats">
            <div>
              <span>Waste Generated</span>
              <strong>{product.stats.waste.value}</strong>
              <p>{product.stats.waste.description}</p>
            </div>
            <div>
              <span>People Involved</span>
              <strong>{product.stats.labor.value}</strong>
              <p>{product.stats.labor.description}</p>
            </div>
            <div>
              <span>Creation Timeline</span>
              <strong>{product.stats.time.value}</strong>
              <p>{product.stats.time.description}</p>
            </div>
          </div>
          <Link to="/" className="product-hero__back">
            ← Back to explorer
          </Link>
        </div>
        <motion.div
          className="product-hero__visual"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
        >
          <ProductCanvas slug={product.slug} />
        </motion.div>
      </motion.div>

      <motion.div
        className="product-details"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <div className="product-details__panel">
          <h2>Supply Chain Journey</h2>
          <ol>
            {product.supplyChain.map((step) => (
              <li key={step}>
                <span className="product-step__marker" />
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="product-details__panel product-details__panel--highlights">
          <h2>Impact Highlights</h2>
          <ul>
            {product.highlights.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </div>
      </motion.div>
    </section>
  );
}

export default ProductPage;

