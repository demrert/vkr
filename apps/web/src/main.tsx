import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const stored = localStorage.getItem('skillatlas-theme');
try {
  const parsed = stored ? (JSON.parse(stored) as { state?: { dark?: boolean } }) : null;
  if (parsed?.state?.dark) {
    document.documentElement.classList.add('dark');
  }
} catch {}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
