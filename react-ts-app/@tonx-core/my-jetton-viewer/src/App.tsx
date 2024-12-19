"use client";
import { useState } from "react";
import "./App.css";
import { TONXJsonRpcProvider } from "@tonx/core";

interface Transaction {
  transaction_hash?: string;
  [key: string]: unknown;
}

export default function App() {
  const [accountBalance, setAccountBalance] = useState<string>("No connection");
  const [lastTransaction, setLastTransaction] = useState<Transaction | string>("No connection");
  const [isLoading, setIsLoading] = useState(false);
  const myJettonAddress = "UQBm2-oK4u9CP56wS4LaPUWV-meDmNnSaD9Jlt-FyRHoBimJ";

  // Step 1: init TONX client
  const client = new TONXJsonRpcProvider({
    network: "testnet", // testnet or mainnet
    apiKey: import.meta.env.VITE_TONXAPI_KEY,
  });

  const handleConnectReload = async () => {
    setIsLoading(true);
    try {
      // Step 2: Fetch the latest transfer-in
      const transactions = await client.getJettonTransfers({ address: myJettonAddress, direction: "in" });
      setLastTransaction(transactions[0].transaction_hash || "No transaction found");

      // Step 3: Fetch Jetton balance
      const balance = await client.getTokenData(transactions[0].source_wallet);
      setAccountBalance(balance.balance / 1000000);
    } catch (error) {
      setAccountBalance("Error fetching balance");
      setLastTransaction("Error fetching transaction");
    }
    setIsLoading(false);
  };

  return (
    <div className="container">
      <header className="header">
        <h1>3 Steps to View Jetton</h1>
        <div className="card">
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <p>
                Get your API key on{" "}
                <a href="https://dashboard.tonxapi.com" target="_blank" rel="noopener noreferrer">
                  dashboard.tonxapi.com
                </a>
              </p>
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

        <h1>Get My Jetton Lastest transfer-in</h1>

        <div className="card">
          <div className="mb-2">
            <h2>Jetton Balance</h2>
            <div className="transaction-container">
              <span className="transaction-hash">{accountBalance}</span>
            </div>
          </div>

          <div>
            <h2>Last Transaction</h2>
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
        </div>

        <div className="text-center">
          <button onClick={handleConnectReload} disabled={isLoading} className={`button ${isLoading ? "loading" : ""}`}>
            {isLoading ? "Loading..." : "Connect & Reload"}
          </button>
        </div>
      </header>
    </div>
  );
}
