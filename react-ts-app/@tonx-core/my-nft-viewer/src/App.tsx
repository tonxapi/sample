/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { TONXJsonRpcProvider } from "@tonx/core";
import './App.css';

interface Transaction {
  transaction_hash?: string;
  [key: string]: unknown;
}

export default function App() {
  const [lastTransaction, setLastTransaction] = useState<Transaction | string>("No connection");
  const [isLoading, setIsLoading] = useState(false);
  const nftAddress = "EQAc4jcphnAeLQ_wmS7e4leWghFysRI_VKUCR0jhiVDX9hXn";

  // Step 1: init TONX client
  const client = new TONXJsonRpcProvider({
    network: "testnet ", // testnet or mainnet
    apiKey: import.meta.env.VITE_TONXAPI_KEY,
  });

  const handleConnectReload = async () => {
    setIsLoading(true);
    try {
      // Step 2: Fetch the latest transfer-in
      const transactions = await client.getNftTransfers({
        address: nftAddress
      });
      setLastTransaction(transactions[0].transaction_hash || "No transaction found");
    } catch (error) {
      setLastTransaction("Error fetching transaction");
    }
    setIsLoading(false);
  };

  return (
    <div className="container">
      <header className="header">
        <h1>3 Steps to TON</h1>
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

        <h1>Get My NFT Latest transfer</h1>

        <div className="card">
          <h2>Latest Transaction</h2>
          <div className="transaction-container">
            {typeof lastTransaction === "object" && lastTransaction?.transaction_hash ? (
              <a
                href={`https://tonviewer.com/${lastTransaction.transaction_hash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {lastTransaction.transaction_hash}
              </a>
            ) : (
              <span className="transaction-hash">
                {typeof lastTransaction === "string" ? lastTransaction : "No transaction found"}
              </span>
            )}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleConnectReload}
            disabled={isLoading}
            className={`button ${isLoading ? 'loading' : ''}`}
          >
            {isLoading ? 'Loading...' : 'Connect & Reload'}
          </button>
        </div>
      </header>
    </div>
  );
}