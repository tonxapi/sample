import { useState } from "react";
import "./App.css";
import { TONXJsonRpcProvider } from '@tonx/core';
import { mnemonicToPrivateKey } from "@ton/crypto";
import {
  Address,
  WalletContractV4,
  internal,
  external,
  beginCell,
  storeMessage,
  toNano,
} from '@ton/ton';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [status, setStatus] = useState("");

  // Constants
  const MNEMONIC = ["your", "mnemonics"]
  const provider = new TONXJsonRpcProvider({
    network: 'testnet',
    apiKey: 'YOUR_API_KEY',
  });

  const handleTransfer = async () => {
    setIsLoading(true);
    setStatus("Starting transfer...");

    try {
      const keyPair = await mnemonicToPrivateKey(MNEMONIC);
      const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: Buffer.from(keyPair.publicKey)
      });

      const walletAddress = wallet.address.toString({
        urlSafe: true,
        bounceable: false,
      });

      setStatus("Checking wallet deployment...");
      const { init } = wallet;
      const contractDeployed = await provider.getAddressState(walletAddress);
      const neededInit = (!contractDeployed && init) ? init : null;

      if (!contractDeployed) {
        throw new Error("Wallet not deployed");
      }

      const seqno = await provider.runGetMethod({
        address: walletAddress,
        method: 'seqno',
        stack: []
      }).then(res => parseInt(res.stack[0][1], 16));
      setStatus("Creating transfer message...");
      const transferAmount = toNano(amount);

      const internalMessage = internal({
        to: Address.parse(recipientAddress),
        value: transferAmount,
        bounce: false
      });

      const externalMessage = external({
        to: walletAddress,
        init: neededInit,
        body: wallet.createTransfer({
          seqno,
          secretKey: keyPair.secretKey,
          messages: [internalMessage],
        }),
      });

      setStatus("Sending transaction...");
      const externalMessageCell = beginCell()
        .store(storeMessage(externalMessage))
        .endCell();

      const boc = externalMessageCell.toBoc().toString('base64');
      await provider.sendMessage(boc);

      const hash = externalMessageCell.hash().toString('hex');
      console.log("message hash: " + hash);

      setStatus("Transfer successful!");
    } catch (error) {
      console.error('Transfer failed:', error);
      setStatus(`Transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="container">
      <header className="header">
        <h1>3 Steps to TON Transfer</h1>
        <div className="card">
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <p>Get your API key from <a href="https://dashboard.tonxapi.com" target="_blank" rel="noopener noreferrer">dashboard.tonxapi.com</a></p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <p>Install TONX SDK</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <p>Enjoy!</p>
            </div>
          </div>
        </div>
      </header>
      <div className="card">
        <h2>Transfer TON</h2>
        <div className="input-container">
          <input
            type="text"
            placeholder="Recipient Address"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            disabled={isLoading}
          />
          <input
            type="number"
            placeholder="Amount in TON"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={isLoading}
          />
          <button
            onClick={handleTransfer}
            disabled={isLoading || !amount || !recipientAddress}
            className={`button ${isLoading ? "loading" : ""}`}
          >
            {isLoading ? "Processing..." : "Transfer"}
          </button>
        </div>
        {status && (
          <div className="status-container">
            <p>{status}</p>
          </div>
        )}
      </div>

    </div>
  );
}