window.global ||= window;

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import HederaWalletsProvider from './utils/context/HederaWalletsContext';
import { ModalProvider } from './components/ConnectToWalletButton.tsx';



createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HederaWalletsProvider>
      <ModalProvider>
        <App />
      </ModalProvider>
    </HederaWalletsProvider>
  </StrictMode>,
)
