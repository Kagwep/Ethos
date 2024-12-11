
  import { useState, useCallback, useEffect, useMemo } from 'react';
  import { HashConnect,HashConnectTypes } from 'hashconnect';
  import { HashConnectConnectionState } from 'hashconnect/dist/types';
  import useHashConnectEvents from './useHashConnectEvents';
  import { AccountId, Transaction, TransactionId, TransactionReceipt } from '@hashgraph/sdk';
  
  export interface HashConnectState {
    availableExtension: HashConnectTypes.WalletMetadata;
    state: HashConnectConnectionState;
    topic: string;
    pairingString: string;
    pairingData: HashConnectTypes.SavedPairingData | null;
  }
  
  const HASHCONNECT_DEBUG_MODE = true;
  
  const hashConnect = new HashConnect(HASHCONNECT_DEBUG_MODE);
  
  const useHashPack = () => {
    const [hashConnectState, setHashConnectState] = useState<Partial<HashConnectState>>({});
    const { isIframeParent } = useHashConnectEvents(hashConnect, setHashConnectState)
  
    // PREPARE APP CONFIG
    const hederaNetworkPrefix = useMemo(() => (
      import.meta.env.VITE_HEDERA_NETWORK === 'testnet' ? `${ import.meta.env.VITE_HEDERA_NETWORK }.` : ''
    ), [])
  
    const appConfig = useMemo<HashConnectTypes.AppMetadata>(() => ({
      name: `${ hederaNetworkPrefix }${ import.meta.env.VITE_WALLET_CONFIG_NAME }`,
      description: import.meta.env.VITE_WALLET_CONFIG_DESCRIPTION,
      icon: import.meta.env.VITE_WALLET_CONFIG_ICON_URL
    }), [hederaNetworkPrefix])


    //INITIALIZATION
   const initializeHashConnect = useCallback(async () => {

    console.log(appConfig, import.meta.env.VITE_HEDERA_NETWORK)

      const hashConnectInitData = await hashConnect.init(appConfig, import.meta.env.VITE_HEDERA_NETWORK, true);
     
  
      if (hashConnectInitData.savedPairings.length > 0) {
        setHashConnectState(prev => ({
          ...prev,
          topic: hashConnectInitData.topic,
          pairingString: hashConnectInitData.pairingString,
          pairingData: hashConnectInitData.savedPairings[0]
        }))
      } else {
        setHashConnectState(prev => ({
          ...prev,
          topic: hashConnectInitData.topic,
          pairingString: hashConnectInitData.pairingString,
        }))
      }
    }, [appConfig]);
  
    useEffect(() => {
      initializeHashConnect()
    }, [initializeHashConnect])
  
    //DISCONNECT
    const disconnectFromHashPack = useCallback(async () => {
      if (hashConnectState.topic) {
        await hashConnect.disconnect(hashConnectState.topic)
  
        setHashConnectState(prev => ({
          ...prev,
          pairingData: undefined
        }))
        hashConnect.hcData.pairingData = []
  
        if (isIframeParent) {
          await hashConnect.clearConnectionsAndData();
        }
      }
    }, [hashConnectState.topic, isIframeParent]);
  
    //CONNECT
    const connectToHashPack = useCallback(() => {
      if (typeof hashConnect?.hcData?.pairingString === 'undefined' || hashConnect.hcData.pairingString === '' ) {
        throw new Error(
          'No pairing key generated! Initialize HashConnect first!'
        );
      }
  
      if (!hashConnectState?.availableExtension || !hashConnect) {
        throw new Error('Hashpack wallet is not detected!');
      }
  
      hashConnect.connectToLocalWallet();
    }, [hashConnectState.availableExtension]);
  
    //POPULATE TRANSACTION
    const populateTransaction = useCallback((tx: Transaction, accountToSign: string) => {
      const transId = TransactionId.generate(accountToSign);
  
      tx.setTransactionId(transId);
      tx.setNodeAccountIds([new AccountId(3)]);
  
      tx.freeze();
  
      return tx;
    }, [])
  
    //SEND TRANSACTION
    const sendTransactionWithHashPack = useCallback(async (tx: Transaction) => {
      if (!hashConnectState.topic) {
        throw new Error('Loading topic Error.');
      }
  
      if (!hashConnectState?.pairingData?.accountIds[0]) {
        throw new Error('No account paired with HashPack!');
      }
  
      tx = populateTransaction(
        tx,
        hashConnectState.pairingData.accountIds[0]
      );
  
      // eslint-disable-next-line no-case-declarations
      const response = await hashConnect?.sendTransaction(hashConnectState.topic, {
        topic: hashConnectState.topic,
        byteArray: tx.toBytes(),
        metadata: {
          accountToSign: hashConnectState.pairingData.accountIds[0],
          returnTransaction: false,
        },
      });
  
      if (response?.receipt) {
        return TransactionReceipt.fromBytes(response.receipt as Uint8Array);
      } else {
        throw new Error('No transaction receipt found!');
      }
    }, [hashConnectState?.pairingData?.accountIds, hashConnectState.topic, populateTransaction]);
  
    return {
      hashConnectState,
      connectToHashPack,
      disconnectFromHashPack,
      sendTransactionWithHashPack,
      isIframeParent
    };
  };
  
  export default useHashPack;