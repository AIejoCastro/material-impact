import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './LandingPage.css';

// Shared easing curve keeps motion language consistent across the experience.
const BASE_EASE = [0.22, 0.61, 0.36, 1];

const heroMotion = {
  initial: { opacity: 0, y: 48, filter: 'blur(4px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { ease: BASE_EASE, duration: 0.85 }
  }
};

// Grid uses staggered entrance to cue scan direction.
const gridMotion = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2
    }
  }
};

// Cards include subtle 3D hover states to reinforce depth without breaking layout.
const cardMotion = {
  initial: { opacity: 0, y: 26, rotateX: -6, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: { ease: BASE_EASE, duration: 0.6 }
  },
  whileHover: {
    y: -10,
    rotateX: 6,
    rotateY: -4,
    scale: 1.01,
    transition: { ease: BASE_EASE, duration: 0.35 }
  },
  whileTap: {
    scale: 0.99,
    y: 0,
    transition: { ease: BASE_EASE, duration: 0.25 }
  }
};

function LandingPage({ products }) {
  return (
    <section className="landing">
      <motion.div className="landing-hero" {...heroMotion}>
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
        variants={gridMotion}
      >
        {products.map((product) => (
          <motion.div
            key={product.slug}
            className="landing-card"
            variants={cardMotion}
            whileHover={cardMotion.whileHover}
            whileTap={cardMotion.whileTap}
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

