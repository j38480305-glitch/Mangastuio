import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomePage } from './pages/HomePage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { StudioPage } from './pages/StudioPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { MangaDetailPage } from './pages/MangaDetailPage';
import { MangaReaderPage } from './pages/MangaReaderPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function ReaderLayout() {
  return <Outlet />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/Mangastuio">
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/studio" element={<StudioPage />} />
            <Route path="/manga/:id" element={<MangaDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route element={<ReaderLayout />}>
            <Route path="/manga/:id/chapter/:chapterId" element={<MangaReaderPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
