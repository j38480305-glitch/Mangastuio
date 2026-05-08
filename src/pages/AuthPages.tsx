import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { BookOpen, Eye, EyeOff } from 'lucide-react';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-terracotta-50 via-sand-50 to-ochre-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta-600 text-white">
              <BookOpen size={22} />
            </div>
            <span className="font-display text-2xl font-bold text-terracotta-900">
              Terra<span className="text-terracotta-600">Manga</span>
            </span>
          </Link>
          <h1 className="mt-6 font-display text-2xl font-bold text-terracotta-900">Welcome back</h1>
          <p className="mt-2 text-sm text-sand-500">Sign in to continue your manga journey</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-sand-200 bg-white p-8 shadow-lg">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <div className="relative">
              <Input
                id="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-sand-400 hover:text-sand-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full mt-6" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          <p className="mt-6 text-center text-sm text-sand-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-terracotta-600 hover:text-terracotta-700">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, username);
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-terracotta-50 via-sand-50 to-ochre-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta-600 text-white">
              <BookOpen size={22} />
            </div>
            <span className="font-display text-2xl font-bold text-terracotta-900">
              Terra<span className="text-terracotta-600">Manga</span>
            </span>
          </Link>
          <h1 className="mt-6 font-display text-2xl font-bold text-terracotta-900">Create your account</h1>
          <p className="mt-2 text-sm text-sand-500">Start creating and sharing manga today</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-sand-200 bg-white p-8 shadow-lg">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Input
              id="username"
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              required
            />
            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <div className="relative">
              <Input
                id="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-sand-400 hover:text-sand-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full mt-6" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>

          <p className="mt-6 text-center text-sm text-sand-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-terracotta-600 hover:text-terracotta-700">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
