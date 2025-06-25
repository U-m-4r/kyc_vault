import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.scss';
import { kyc_vault_backend } from '../../declarations/kyc_vault_backend';
window.backend = kyc_vault_backend;


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

