import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './App.css';
import { getOrCreateActiveUser } from './lib/seed.js';

async function boot() {
  await getOrCreateActiveUser();
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

boot();
