import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWalletInterface } from '../services/wallets/useWalletInterface';
import { WalletSelectionDialog } from './WalletSelectionDialog';
import { Menu, X } from 'lucide-react';

export const NavBar: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('/provision');
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const { accountId, walletInterface } = useWalletInterface();
  const location = useLocation();

  const handleConnect = async (): Promise<void> => {
    if (accountId) {
      await walletInterface.disconnect();
    } else {
      setOpen(true);
    }
  };

  useEffect(() => {
    if (accountId) {
      setOpen(false);
    }
  }, [accountId]);

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location]);

  const tabs = [
    { path: '/provision', label: 'Data Provision' },
    { path: '/survey', label: 'Survey and Research' },
    { path: '/feedback', label: 'Feedback' },
    { path: '/research', label: 'Insight' },

  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="h-18 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo Section */}
          <Link
            to="/"
            className="flex items-center gap-4 group px-6"
          >
            <img
              src="/logo.png"
              alt="Ethos Logo"
              className="h-9 w-auto transition-transform duration-200 group-hover:scale-110"
            />
            <span className="text-xl font-semibold text-gray-800 transition-colors duration-200 group-hover:text-blue-600">
              Ethos
            </span>
          </Link>

          {/* Hamburger Menu Icon */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className={`hidden md:flex items-center space-x-8 px-6`}>
            {tabs.map((tab) => (
              <Link
                key={tab.path}
                to={tab.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${activeTab === tab.path 
                    ? 'text-blue-600 bg-blue-50 shadow-inner' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                  }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>

          {/* Connect Button */}
          <button
            onClick={handleConnect}
            className={`ml-auto hidden md:block px-6 py-2 rounded-lg font-medium shadow-md transition-all duration-200 
              ${accountId 
                ? 'text-blue-600 border border-blue-600 bg-blue-50 hover:bg-blue-100' 
                : 'text-white bg-blue-600 hover:bg-blue-700 shadow-lg active:translate-y-0.5'
              }`}
          >
            {accountId ? `Connected: ${accountId}` : 'Connect Wallet'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 bg-white border-t border-gray-200">
          {tabs.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              onClick={() => setMenuOpen(false)}
              className={`block w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 mb-2
                ${activeTab === tab.path 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`}
            >
              {tab.label}
            </Link>
          ))}

          {/* Connect Button for Mobile */}
          <button
            onClick={handleConnect}
            className={`w-full px-6 py-2 rounded-lg font-medium shadow-md transition-all duration-200 
              ${accountId 
                ? 'text-blue-600 border border-blue-600 bg-blue-50 hover:bg-blue-100' 
                : 'text-white bg-blue-600 hover:bg-blue-700 shadow-lg'
              }`}
          >
            {accountId ? `Connected: ${accountId}` : 'Connect Wallet'}
          </button>
        </div>
      )}

      <WalletSelectionDialog open={open} setOpen={setOpen} onClose={() => setOpen(false)} />
    </nav>
  );
};