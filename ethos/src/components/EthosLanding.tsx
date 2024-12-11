import React, { useContext } from 'react';
import { ConnectionModal, ModalContext } from './ConnectToWalletButton';


const EthosLanding = () => {
  const { setModalContent, showModal } = useContext(ModalContext);

  const handleConnectWallet = () => {
    setModalContent(<ConnectionModal />);
    showModal();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold text-blue-600">Ethos</div>
            <button
              onClick={handleConnectWallet}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Insights on <span className="text-blue-600">Hedera</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transform raw data into verifiable intelligence using the power of AI and Hedera's secure ledger.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-blue-600 text-xl font-semibold mb-4">Data Integrity</div>
            <p className="text-gray-600">
              Ensure your data remains tamper-proof and traceable through Hedera's decentralized ledger technology.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-blue-600 text-xl font-semibold mb-4">AI Analytics</div>
            <p className="text-gray-600">
              Transform unstructured data into actionable insights using advanced AI algorithms.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-blue-600 text-xl font-semibold mb-4">Industry Solutions</div>
            <p className="text-gray-600">
              Tailored solutions for various industries to optimize operations and drive innovation.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 rounded-2xl p-8 mb-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex-1">
                <div className="text-lg font-semibold text-blue-600 mb-2">1. Connect</div>
                <p className="text-gray-600">Link your Hedera wallet to get started</p>
              </div>
              <div className="flex-1">
                <div className="text-lg font-semibold text-blue-600 mb-2">2. Upload</div>
                <p className="text-gray-600">Submit your raw data for analysis</p>
              </div>
              <div className="flex-1">
                <div className="text-lg font-semibold text-blue-600 mb-2">3. Transform</div>
                <p className="text-gray-600">Receive verified AI-powered insights</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <button
            onClick={handleConnectWallet}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg"
          >
            Connect Your Wallet
          </button>
        </div>
      </main>

      <footer className="bg-gray-50 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-600">
            © 2024 Ethos. Powered by Hedera Hashgraph
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EthosLanding;