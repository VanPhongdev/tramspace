import { motion } from 'framer-motion';

const EASE = [0.4, 0, 0.2, 1];

const variants = {
  initial: { opacity: 0, x: 32 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.38, ease: EASE },
  },
  exit: {
    opacity: 0,
    x: -32,
    transition: { duration: 0.25, ease: EASE },
  },
};

/**
 * Bọc nội dung trang để có hiệu ứng Fade + Slide
 * khi chuyển route qua AnimatePresence ở App.jsx.
 */
export default function PageTransition({ children }) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ width: '100%', minHeight: '100vh' }}
    >
      {children}
    </motion.div>
  );
}
