import { Dialog } from "@mui/material";
import { connectToMetamask } from "../services/wallets/metamask/metamaskClient";
import { openWalletConnectModal } from "../services/wallets/walletconnect/walletConnectClient";
import MetamaskLogo from "../assets/metamask-logo.svg";
import WalletConnectLogo from "../assets/walletconnect-logo.svg";

interface WalletSelectionDialogProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  onClose: (value: string) => void;
}

export const WalletSelectionDialog = (props: WalletSelectionDialogProps) => {
  const { onClose, open, setOpen } = props;

  return (
    <Dialog
      onClose={onClose}
      open={open}
      PaperProps={{
      }}
    >
      <div className="bg-white rounded-lg shadow-lg w-80 p-6 relative">
        <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">
          Select Wallet
        </h2>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => {
              openWalletConnectModal();
              setOpen(false);
            }}
            className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded transition"
          >
            <img
              src={WalletConnectLogo}
              alt="WalletConnect Logo"
              className="h-6"
            />
            WalletConnect
          </button>
          <button
            onClick={() => {
              connectToMetamask();
              setOpen(false);
            }}
            className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-medium px-4 py-2 rounded transition"
          >
            <img src={MetamaskLogo} alt="Metamask Logo" className="h-6" />
            Metamask
          </button>
        </div>
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={() => onClose("")}
        >
          &times;
        </button>
      </div>
    </Dialog>
  );
};
