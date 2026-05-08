import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { BookOpen, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-terracotta-50 via-sand-50 to-ochre-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-terracotta-100 text-terracotta-600">
            <BookOpen size={40} />
          </div>
        </div>
        <h1 className="font-display text-5xl font-extrabold text-terracotta-900">404</h1>
        <p className="mt-3 font-display text-xl font-semibold text-terracotta-700">
          Lost in the Manga-verse
        </p>
        <p className="mt-2 text-sand-500 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved to another dimension.
        </p>
        <Button className="mt-8 gap-2" onClick={() => navigate('/')}>
          <Home size={16} /> Go Home
        </Button>
      </motion.div>
    </div>
  );
}
