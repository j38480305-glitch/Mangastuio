import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './hooks/useAuth';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Spinner } from './components/ui/Spinner';

// Lazy-load all pages
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/AuthPages').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/AuthPages').then(m => ({ default: m.RegisterPage })));
const StudioPage = lazy(() => import('./pages/StudioPage'));
const DiscoverPage = lazy(() => import('./pages/DiscoverPage'));
const MangaDetailPage = lazy(() => import('./pages/MangaDetailPage'));
const MangaReaderPage = lazy(() => import('./pages/MangaReaderPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function Layout() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={
          <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <Spinner />
          </div>
        }>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/studio" element={<StudioPage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/manga/:id" element={<MangaDetailPage />} />
              <Route path="/manga/:id/read/:chapterId" element={<MangaReaderPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
