import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductCanvas from '../components/ProductCanvas';
import './ProductPage.css';

// Shared motion curve tuned for premium-feeling transitions.
const BASE_EASE = [0.22, 0.61, 0.36, 1];

// Hero transitions stagger softly to draw focus from headline to supporting data.
const heroVariants = {
  hidden: { opacity: 0, y: 54 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      ease: BASE_EASE,
      duration: 0.85,
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const heroChildVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { ease: BASE_EASE, duration: 0.6 } }
};

// Panels settle with a slight scale ease to feel anchored yet responsive.
const panelVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { ease: BASE_EASE, duration: 0.6 }
  }
};

function ProductPage({ product }) {
  return (
    <section className="product" style={{ '--hero-color': product.palette.primary }}>
      <motion.div className="product-hero" initial="hidden" animate="show" variants={heroVariants}>
        <motion.div className="product-hero__copy" variants={heroChildVariants}>
          <motion.p className="product-hero__category" variants={heroChildVariants}>
            {product.category}
          </motion.p>
          <motion.h1 variants={heroChildVariants}>{product.name}</motion.h1>
          <motion.p className="product-hero__headline" variants={heroChildVariants}>
            {product.headline}
          </motion.p>
          <motion.div className="product-hero__stats" variants={heroChildVariants}>
            {[
              {
                label: 'Waste Generated',
                value: product.stats.waste.value,
                description: product.stats.waste.description
              },
              {
                label: 'People Involved',
                value: product.stats.labor.value,
                description: product.stats.labor.description
              },
              {
                label: 'Creation Timeline',
                value: product.stats.time.value,
                description: product.stats.time.description
              }
            ].map((stat) => (
              <motion.div
                key={stat.label}
                variants={heroChildVariants}
                transition={{ ease: BASE_EASE, duration: 0.55 }}
              >
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
                <p>{stat.description}</p>
              </motion.div>
            ))}
          </motion.div>
          <motion.div variants={heroChildVariants}>
            <Link to="/" className="product-hero__back">
              ← Back to explorer
            </Link>
          </motion.div>
        </motion.div>
        <motion.div className="product-hero__visual" variants={heroChildVariants}>
          <div className="product-hero__visual-scene">
            <ProductCanvas slug={product.slug} palette={product.palette} />
            <div className="product-hero__visual-gradient" />
          </div>
        </motion.div>
      </motion.div>

      <motion.div
        className="product-details"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.14,
              delayChildren: 0.3
            }
          }
        }}
      >
        <motion.div className="product-details__panel" variants={panelVariants}>
          <h2>Supply Chain Journey</h2>
          <ol>
            {product.supplyChain.map((step) => (
              <li key={step}>
                <span className="product-step__marker" />
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </motion.div>
        <motion.div className="product-details__panel product-details__panel--highlights" variants={panelVariants}>
          <h2>Impact Highlights</h2>
          <ul>
            {product.highlights.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default ProductPage;

