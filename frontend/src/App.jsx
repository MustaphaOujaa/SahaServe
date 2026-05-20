import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Partials/Navbar';
import Footer from './Components/Partials/Footer';
import HomePage from './Pages/HomePage';
import RegisterPage from './Pages/RegisterPage';
import LoginPage from './Pages/LoginPage';
import Soa from './Components/Soa';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Toaster 
            position="top-right" 
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1a0f00',
                color: '#fff',
                border: '1px solid rgba(200, 146, 42, 0.2)',
                borderRadius: '12px',
                fontSize: '0.85rem',
              },
              success: {
                iconTheme: {
                  primary: '#c8922a',
                  secondary: '#fff',
                },
              },
            }} 
          />
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
          <Footer />
          <Soa />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
