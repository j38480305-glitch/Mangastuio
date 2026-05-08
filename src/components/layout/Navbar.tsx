import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Compass, PenTool, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { useState } from 'react';

export function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname.startsWith(path);

  const navLinks = [
    { to: '/discover', label: 'Discover', icon: Compass },
    { to: '/studio', label: 'Studio', icon: PenTool },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-sand-200 bg-white/90 backdrop-blur-lg">
      <div className="page-container">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-terracotta-600 text-white transition-transform group-hover:scale-105">
              <BookOpen size={20} />
            </div>
            <span className="font-display text-xl font-bold text-terracotta-900">
              Terra<span className="text-terracotta-600">Manga</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive(to)
                    ? 'bg-terracotta-50 text-terracotta-700'
                    : 'text-sand-600 hover:bg-sand-100 hover:text-terracotta-700'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User size={16} />
                    Profile
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={signOut} className="gap-2 text-sand-500">
                  <LogOut size={16} />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden rounded-lg p-2 text-sand-500 hover:bg-sand-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-sand-100 py-4 space-y-2">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium ${
                  isActive(to) ? 'bg-terracotta-50 text-terracotta-700' : 'text-sand-600'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            ))}
            <div className="border-t border-sand-100 pt-3 px-4 space-y-2">
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full gap-2">
                      <User size={16} /> Profile
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={signOut} className="w-full gap-2 text-sand-500">
                    <LogOut size={16} /> Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full">Sign In</Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)}>
                    <Button size="sm" className="w-full">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
