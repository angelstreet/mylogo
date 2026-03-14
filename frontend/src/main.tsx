import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './i18n';
import App from './App';
import './index.css';

// Runtime basename: /mylogo on subpath, empty on domain
const slug = '/mylogo';
const basename = window.location.pathname.startsWith(slug) ? slug : '';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
