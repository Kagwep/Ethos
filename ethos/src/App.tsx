// App.tsx
import Footer from './components/Footer';
import CssBaseline from '@mui/material/CssBaseline';
import {NavBar} from './components/Navbar';
import { Box, ThemeProvider } from '@mui/material';
import { AllWalletsProvider } from './services/wallets/AllWalletsProvider';
import AppRouter from './AppRouter';
import colorBackground from './assets/colors.png';
import { theme } from './theme';
import "./App.css";
import { BrowserRouter as Router } from 'react-router-dom';

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <AllWalletsProvider>
          <CssBaseline />
            <header>
              <NavBar />
            </header>
            <AppRouter />
            <Footer />
        </AllWalletsProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;