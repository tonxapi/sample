import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TonConnectUIProvider, THEME } from '@tonconnect/ui-react';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TonConnectUIProvider uiPreferences={{ theme: THEME.DARK }} manifestUrl="https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json">
      <App />
    </TonConnectUIProvider>
  </StrictMode>,
)
