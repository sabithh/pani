import { motion } from 'framer-motion';
import { fadeUp } from '../../lib/motion';

export function EmptyState({ icon, title, description, action }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center text-center py-20 px-6"
    >
      {icon && (
        <div className="w-20 h-20 rounded-full bg-surface flex items-center justify-center mb-5 text-4xl">
          {icon}
        </div>
      )}
      <h3 className="font-serif text-2xl font-bold mb-2">{title}</h3>
      {description && (
        <p className="text-text-secondary max-w-md mb-6">{description}</p>
      )}
      {action}
    </motion.div>
  );
}
