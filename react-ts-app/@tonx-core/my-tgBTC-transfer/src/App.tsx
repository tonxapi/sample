import React, { useEffect, useState } from 'react';
import "./App.css";
import { TonConnectButton, useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import { TONXJsonRpcProvider } from '@tonx/core'
import { Address, beginCell, toNano } from '@ton/core';

const TgBTCTransfer = () => {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const client = new TONXJsonRpcProvider({
    network: 'testnet',
    apiKey: import.meta.env.VITE_TONXAPI_KEY
  });

  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState(0);
  const [transferAmount, setTransferAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [jettonWallet, setJettonWallet] = useState('');

  const TGBTC_ADDRESS = '0:7D858A3DEF200FDA2B18C22485C66D4139B42B698F11985374D8943222CED4AA';
  const JETTON_QUANTITY = 100000000;

  useEffect(() => {
    if (wallet) {
      getTgBTCAmount();
    }
  }, [wallet]);

  const getTgBTCAmount = async () => {
    const wallets = await client.getJettonWallets({ owner_address: wallet?.account.address });
    const tgBTCWallet = wallets.find((wallet: { jetton: string; }) => wallet.jetton === TGBTC_ADDRESS);
    setAmount(tgBTCWallet.balance / JETTON_QUANTITY);
    setJettonWallet(tgBTCWallet.address);
  }

  const onClickSend = async () => {
    setIsLoading(true);
    setIsSuccessful(false);
    try {
      const messageBody = beginCell()
        .storeUint(0xf8a7ea5, 32)
        .storeUint(0, 64)
        .storeCoins(BigInt(transferAmount * JETTON_QUANTITY))
        .storeAddress(Address.parse(recipientAddress))
        .storeAddress(Address.parse(wallet?.account.address as string))
        .storeBit(0)
        .storeCoins(toNano("0.02"))
        .storeBit(1)
        .storeRef(
          beginCell()
            .storeUint(0, 32)
            .storeStringTail('Send By TONX API')
            .endCell()
        )
        .endCell().toBoc().toString('base64');

      await tonConnectUI.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 360,
        messages: [{
          address: jettonWallet,
          amount: "50000000",
          payload: messageBody
        }]
      });

      await waitForTransactionConfirmation();
      await getTgBTCAmount();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const waitForTransactionConfirmation = async () => {
    const TIMEOUT_SECONDS = 300;
    const POLL_INTERVAL = 1000;
    const initialTransactionLT = await getTransferCount();

    for (let attempts = 0; attempts < TIMEOUT_SECONDS; attempts++) {
      try {
        const currentTransactionLT = await getTransferCount();
        if (currentTransactionLT > initialTransactionLT) {
          setIsSuccessful(true);
          return;
        }
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
      } catch (error) {
        console.error('Transaction check failed:', error);
      }
    }
    throw new Error('Transaction confirmation timeout');
  };

  const getTransferCount = async () => {
    const transfers = await client.getJettonTransfers({
      address: wallet?.account.address,
      jetton_master: TGBTC_ADDRESS,
      direction: 'out',
    });
    if (!transfers?.[0]?.transaction_lt) {
      return 0;
    }
    return parseInt(transfers[0].transaction_lt);
  };

  return (
    <div className="container">
      <div className="header">
        <div className="version">
          <TonConnectButton />
        </div>

        <h1 className='border'>TONX API</h1>
        <h2 className='mb-2'>tgBTC dApp Example</h2>

        {wallet ? <div className="card">
          <div className='balance-amount mb-2'>
            tgBTC Balance: {amount}
          </div>

          <div className="input-container">
            <input
              type="text"
              placeholder="Recipient Address (Testnet)"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              disabled={isLoading}
            />

            <input
              type="number"
              placeholder="tgBTC Amount"
              value={transferAmount}
              onChange={(e) => setTransferAmount(Number(e.target.value))}
              disabled={isLoading}
            />

            <button
              onClick={onClickSend}
              disabled={isLoading || !transferAmount || !recipientAddress}
              className={`button ${isLoading ? 'loading' : ''}`}
            >
              {isLoading ? 'Processing...' : 'Send'}
            </button>
          </div>

          {isLoading && (
            <div className="transaction-container">
              <p>Processing transaction...</p>
            </div>
          )}

          {
            isSuccessful &&
            (<div className="transaction-container">
              <p>Successful</p>
            </div>)
          }
        </div> : <div className="card">
          <div className="text-center">
            <div className="balance-amount mb-2">
              Welcome to tgBTC Transfer
            </div>

            <div className="status-container">
              <p>Please connect your TON wallet to view your tgBTC balance and make transfers</p>
            </div>


            <div className="step">
              <div className="step-number">1</div>
              <div>Click the Connect Wallet button above</div>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <div>Select your TON wallet</div>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <div>Start making secure transfers</div>
            </div>
          </div>
        </div>}

      </div>
    </div>
  );
};

export default TgBTCTransfer;