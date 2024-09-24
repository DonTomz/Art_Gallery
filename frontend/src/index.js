import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="178034908813-r3g51hrfa86fclssiq8fkfvtauj737to.apps.googleusercontent.com">;
    <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);

