import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AppointmentsPage from './pages/AppointmentsPage';
import PharmacyPage from './pages/PharmacyPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SchedulePage from './pages/SchedulePage';
import DoctorPage from './pages/DoctorPage';
import PriceListPage from './pages/PriceListPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
export function App() {
  return <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-white pt-16">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/schedule" element={<SchedulePage />} />
              <Route path="/doctors/:id" element={<DoctorPage />} />
              <Route path="/prices" element={<PriceListPage />} />
              <Route path="/appointments" element={<ProtectedRoute>
                    <AppointmentsPage />
                  </ProtectedRoute>} />
              <Route path="/pharmacy" element={<ProtectedRoute>
                    <PharmacyPage />
                  </ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>} />
              <Route path="/news" element={<NewsPage />} />
              <Route path="/news/:id" element={<NewsDetailPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>;
}