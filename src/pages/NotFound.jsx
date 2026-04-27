import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';
import { PageTransition } from '../components/layout/PageTransition';
import { Button } from '../components/ui/Button';

export default function NotFound() {
  return (
    <PageTransition>
      <div className="min-h-[80vh] flex items-center justify-center px-6 py-20 text-center">
        <div className="max-w-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 18 }}
            className="text-7xl mb-4"
          >
            🪄
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-5xl sm:text-7xl font-black m-0 mb-3 text-primary-dark"
          >
            404
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-serif text-2xl sm:text-3xl m-0 mb-3"
          >
            Ayo that page did some pani and disappeared 👀
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-text-secondary mb-7"
          >
            The link's broken or moved. Let's get you back to the good stuff.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-3"
          >
            <Link to="/">
              <Button variant="primary" leftIcon={<Home size={16} />}>Take me home</Button>
            </Link>
            <Link to="/workers">
              <Button variant="secondary" leftIcon={<ArrowLeft size={16} />}>Browse workers</Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
