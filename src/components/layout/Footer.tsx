import { BookOpen, Github, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-sand-200 bg-white">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-terracotta-600 text-white">
                <BookOpen size={18} />
              </div>
              <span className="font-display text-lg font-bold text-terracotta-900">
                Terra<span className="text-terracotta-600">Manga</span>
              </span>
            </Link>
            <p className="mt-3 text-sm text-sand-500 leading-relaxed">
              Create, share, and discover manga with AI-powered geometric character generation.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-terracotta-900">Platform</h3>
            <ul className="mt-3 space-y-2">
              {['Discover', 'Creator Studio', 'Reader', 'Community'].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-sm text-sand-500 hover:text-terracotta-600 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-terracotta-900">Resources</h3>
            <ul className="mt-3 space-y-2">
              {['Getting Started', 'AI Generation Guide', 'Style Reference', 'API Docs'].map((item) => (
                <li key={item}>
                  <Link to="/" className="text-sm text-sand-500 hover:text-terracotta-600 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-terracotta-900">Connect</h3>
            <div className="mt-3 flex gap-3">
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-sand-100 text-sand-500 hover:bg-terracotta-50 hover:text-terracotta-600 transition-colors">
                <Twitter size={16} />
              </a>
              <a href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-sand-100 text-sand-500 hover:bg-terracotta-50 hover:text-terracotta-600 transition-colors">
                <Github size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-sand-100 pt-6 text-center">
          <p className="text-sm text-sand-400">
            &copy; {new Date().getFullYear()} TerraManga. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
