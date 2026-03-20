import { motion } from 'framer-motion';

const MotionDiv = motion.div;

export default function PageTransition({ children, routeKey }) {
  return (
    <MotionDiv
      key={routeKey}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionDiv>
  );
}
