import React from 'react';
import useHashPack from '../wallets/useHashPack';

interface HederaWalletsContextType {
  hashPack: ReturnType<typeof useHashPack>;
}

const INITIAL_CONTEXT: HederaWalletsContextType = {
  hashPack: {
    hashConnectState: {},
    isIframeParent: false,
    connectToHashPack: () => undefined,
    disconnectFromHashPack: () => Promise.resolve(),
    sendTransactionWithHashPack: () => Promise.reject(),
  },
};

export const HederaWalletsContext = React.createContext(INITIAL_CONTEXT);

export default function HederaWalletsProvider({
  children,
}: {
  children: React.ReactElement;
}) {
  const hashPack = useHashPack();

  return (
    <HederaWalletsContext.Provider
      value={{ hashPack }}
    >
      {children}
    </HederaWalletsContext.Provider>
  );
}