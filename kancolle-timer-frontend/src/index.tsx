import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Amplify } from '@aws-amplify/core';
import config from './aws-exports';
Amplify.configure(config);

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
