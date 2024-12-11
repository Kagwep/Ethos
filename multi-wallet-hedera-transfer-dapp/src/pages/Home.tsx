import { AccountId } from "@hashgraph/sdk";
import { Button, TextField, Typography } from "@mui/material";
import { Stack } from "@mui/system";
import SendIcon from '@mui/icons-material/Send';
import { useState } from "react";
import { useWalletInterface } from "../services/wallets/useWalletInterface";

export default function Home() {
  const { walletInterface } = useWalletInterface();
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState(1);
  const [transactionStatus, setTransactionStatus] = useState("");

  const handleTransfer = async () => {
    if (!toAccountId || amount <= 0) {
      setTransactionStatus("Invalid account ID or amount.");
      return;
    }

    try {
      const txId = await walletInterface?.transferHBAR(AccountId.fromString(toAccountId), amount);
      setTransactionStatus(`Transaction successful! ID: ${txId}`);
    } catch (error) {
      //setTransactionStatus(`Error: ${error!.message}`);
    }
  };

  return (
    <Stack alignItems="center" spacing={4} sx={{ padding: 4, backgroundColor: '#282c34', minHeight: '100vh', color: 'white' }}>
      <Typography variant="h3" textAlign="center">
        Empowering Insights with AI & Hedera
      </Typography>
      <Typography variant="h6" textAlign="center">
        Secure, actionable data for smarter decision-making
      </Typography>
      {walletInterface ? (
        <>
          <Stack direction="row" gap={2} alignItems="center">
            <Typography>Transfer</Typography>
            <TextField
              type="number"
              label="Amount (HBAR)"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
              sx={{ maxWidth: '100px', backgroundColor: 'white', borderRadius: 1 }}
            />
            <Typography>to</Typography>
            <TextField
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              label="Account ID or EVM Address"
              sx={{ backgroundColor: 'white', borderRadius: 1 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleTransfer}
              endIcon={<SendIcon />}
            >
              Send
            </Button>
          </Stack>
          {transactionStatus && (
            <Typography variant="body2" color="info.main" sx={{ marginTop: 2 }}>
              {transactionStatus}
            </Typography>
          )}
        </>
      ) : (
        <Typography>
          Please connect your wallet to get started.
        </Typography>
      )}
    </Stack>
  );
}

