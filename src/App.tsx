import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import { AuthProvider } from './context/AuthContext';
import { PortfolioProvider } from './context/PortfolioContext';
import Home from './pages/Home';

// Everything except the portfolio page itself is loaded on demand
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = React.lazy(() => import('./pages/TermsOfService'));

const PageFallback = () => (
    <div className="min-h-screen section-obsidian flex items-center justify-center" role="status">
        <div className="w-8 h-8 rounded-full border-2 border-accent-indigo border-t-transparent animate-spin" />
        <span className="sr-only">Loading…</span>
    </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <PortfolioProvider>
          <a href="#main" className="skip-link">Skip to content</a>
          <Navbar />
          <main id="main" tabIndex={-1} className="outline-none">
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Register />} />
                <Route path='/dashboard' element={<Dashboard />} />
                <Route path='/u/:slug' element={<Home />} />
                <Route path='/user/:userId' element={<Home />} />
                <Route path='/privacy-policy' element={<PrivacyPolicy />} />
                <Route path='/terms-of-service' element={<TermsOfService />} />
                <Route path='/' element={<Home />} />
              </Routes>
            </Suspense>
          </main>
        </PortfolioProvider>
      </AuthProvider>
    </Router>
  )
}

export default App;
