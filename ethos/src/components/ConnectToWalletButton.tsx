import React, { useState, useCallback, useContext, useMemo } from 'react';
import { isMobile } from 'react-device-detect';
import isString from 'lodash/isString';
import useHederaWallets, { ConnectionStateType } from '../utils/hooks/useHederaWallets';
import BladeWalletLogo from '../assets/images/wallets/bladewallet.svg'
import HashpackWalletLogo from '../assets/images/wallets/hashpack.svg'

// Modal Context
export type ModalContentType = HTMLElement | string | React.ReactNode;

type ModalContextProps = {
  closeModal: () => void;
  showModal: () => void;
  isModalShowed: boolean;
  modalContent: ModalContentType;
  setModalContent: (el: ModalContentType) => void;
};

export const ModalContext = React.createContext<ModalContextProps>({
  closeModal: () => undefined,
  showModal: () => undefined,
  isModalShowed: false,
  modalContent: '',
  setModalContent: () => undefined,
});

// Modal Provider Component
export const ModalProvider = ({ children }: { children: React.ReactElement }) => {
  const [isModalShowed, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState<ModalContentType>(<p>Modal is empty!</p>);

  const showModal = useCallback(() => {
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  return (
    <ModalContext.Provider
      value={{
        closeModal,
        showModal,
        isModalShowed,
        modalContent,
        setModalContent,
      }}
    >
      {children}
      {isModalShowed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            {modalContent as any}
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
};

// Wallet Connection Button Component
const ConnectToWalletButton = ({
  isEnabled = true,
  walletType,
  logoImageSrc,
  blurLogoImage,
  staticLabel
}:
{
isEnabled: any,
walletType: any,
logoImageSrc: any,
blurLogoImage: any,
staticLabel : any
}
) => {
  const { userWalletId, connectedWalletType, connect, disconnect, isIframeParent } = useHederaWallets();
  const { closeModal } = useContext(ModalContext);

  const connectToWalletButtonOnClick = useCallback(() => {
    if (!isEnabled) return;
    
    if (connectedWalletType === walletType) {
      disconnect();
    } else {
      connect(walletType);
      closeModal();
    }
  }, [closeModal, connect, connectedWalletType, disconnect, isEnabled, walletType]);

  const connectToWalletButtonImage = useMemo(() => (
    logoImageSrc ? (
      <img 
        src={logoImageSrc} 
        alt={`connect-to-wallet-button-${walletType}-logo`}
        className="w-6 h-6 object-contain"
      />
    ) : null
  ), [logoImageSrc, walletType]);

  const walletName = useMemo(() => {
    switch (walletType) {
      case ConnectionStateType.HASHPACK:
        return 'HashPack';
      default:
        return '';
    }
  }, [walletType]);

  const connectToWalletButtonContent = useMemo(() => {
    if (isString(staticLabel)) {
      return staticLabel;
    }
    if (isEnabled && connectedWalletType === walletType) {
      return `Disconnect from account ${userWalletId}`;
    }
    if (isIframeParent && walletType === ConnectionStateType.HASHPACK) {
      return 'Please login using the Hashpack DAPP explorer in the wallet';
    }
    if (isMobile) {
      if (walletType === ConnectionStateType.HASHPACK) {
        return `Log in using the ${walletName} mobile dApp explorer`;
      }
    }
    if (!isEnabled) {
      return 'Coming soon';
    }
    return (userWalletId && walletType !== connectedWalletType)
      ? `Switch to ${walletName}`
      : 'Click to connect';
  }, [isEnabled, staticLabel, connectedWalletType, walletType, isIframeParent, userWalletId, walletName]);

  return (
    <button
      disabled={!isEnabled}
      className={`
        flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-all
        ${isEnabled ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}
        ${blurLogoImage ? 'backdrop-blur-sm opacity-50' : ''}
      `}
      onClick={connectToWalletButtonOnClick}
      type="button"
    >
      {connectToWalletButtonImage}
      <p>{connectToWalletButtonContent}</p>
    </button>
  );
};

// Connection Modal Component
export const ConnectionModal = () => {
  const { userWalletId, isIframeParent } = useHederaWallets();

  const isHashPackConnectionButtonEnabledInDAppExplorer = useMemo(() => (
    isIframeParent && !!userWalletId
  ), [isIframeParent, userWalletId]);

  const isHashPackConnectionComponentEnabled = useMemo(() => {
    if (!isIframeParent && !isMobile) {
      return true;
    }
    if (isIframeParent) {
      return isHashPackConnectionButtonEnabledInDAppExplorer;
    }
    return false;
  }, [isIframeParent, isHashPackConnectionButtonEnabledInDAppExplorer]);

  return (
    <div className="w-full">
      <div className={`
        flex flex-col gap-4 w-full
        ${isIframeParent ? '' : 'md:flex-row'}
      `}>
        <ConnectToWalletButton
          isEnabled={isHashPackConnectionComponentEnabled}
          walletType={ConnectionStateType.HASHPACK}
          logoImageSrc={HashpackWalletLogo}
          blurLogoImage={false}
          staticLabel=""
        />
        {!isIframeParent && (
          <ConnectToWalletButton
            walletType={ConnectionStateType.BLADEWALLET}
            logoImageSrc={BladeWalletLogo}
            blurLogoImage
            staticLabel="Blade wallet currently unavailable"
            isEnabled={false}
          />
        )}
      </div>
    </div>
  );
};

