import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './LandingPage.css';

function LandingPage({ products }) {
  return (
    <section className="landing">
      <motion.div
        className="landing-hero"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <p className="landing-eyebrow">Material Impact Explorer</p>
        <h1>
          Untangle the hidden <span>human</span> and <span>planetary</span>{' '}
          cost of everyday products.
        </h1>
        <p className="landing-subtitle">
          Navigate immersive, 3D-enhanced stories that translate complex supply
          chains into tangible insights. Each page decodes waste generation,
          human effort, and the time horizons behind the objects that define
          our lives.
        </p>
      </motion.div>

      <motion.div
        className="landing-grid"
        initial="initial"
        animate="animate"
        variants={{
          animate: {
            transition: {
              staggerChildren: 0.08
            }
          }
        }}
      >
        {products.map((product) => (
          <motion.div
            key={product.slug}
            className="landing-card"
            variants={{
              initial: { opacity: 0, y: 30, rotateX: -8 },
              animate: { opacity: 1, y: 0, rotateX: 0 }
            }}
            whileHover={{ y: -8, rotateX: 6, rotateY: -4 }}
          >
            <div
              className="landing-card__backdrop"
              style={{
                background: `linear-gradient(135deg, ${product.palette.primary} 0%, ${product.palette.secondary} 50%, ${product.palette.accent} 100%)`
              }}
            />
            <div className="landing-card__content">
              <p className="landing-card__category">{product.category}</p>
              <h2>{product.name}</h2>
              <p className="landing-card__headline">{product.headline}</p>
              <div className="landing-card__stats">
                <div>
                  <span>Waste</span>
                  <strong>{product.stats.waste.value}</strong>
                </div>
                <div>
                  <span>Humans Involved</span>
                  <strong>{product.stats.labor.value}</strong>
                </div>
                <div>
                  <span>Timeline</span>
                  <strong>{product.stats.time.value}</strong>
                </div>
              </div>
            </div>
            <Link to={`/${product.slug}`} className="landing-card__cta">
              Explore story →
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export default LandingPage;

