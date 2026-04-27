import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App.jsx';
import { AuthProvider } from './lib/auth.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: 'var(--color-bg)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: '14px',
              boxShadow: '0 10px 30px rgba(45, 26, 14, 0.12)',
              padding: '12px 16px',
              fontFamily: '"DM Sans", system-ui, sans-serif',
              fontWeight: 500,
            },
            success: {
              iconTheme: { primary: 'var(--color-success)', secondary: 'white' },
            },
            error: {
              iconTheme: { primary: 'var(--color-urgent)', secondary: 'white' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
