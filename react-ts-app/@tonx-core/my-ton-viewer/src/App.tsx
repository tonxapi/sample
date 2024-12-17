"use client";
import { useState } from "react";
import "./App.css";
import { TONXJsonRpcProvider } from "@tonx/core";

interface Transaction {
  hash?: string;
  [key: string]: any;
}

export default function App() {
  const [accountBalance, setAccountBalance] = useState<string>("No connection");
  const [lastTransaction, setLastTransaction] = useState<Transaction | string>("No connection");
  const [isLoading, setIsLoading] = useState(false);
  const myTonAddress = "EQDi1eWU3HWWst8owY8OMq2Dz9nJJEHUROza8R-_wEGb8yu6";

  // Step 1: init TONX client
  const client = new TONXJsonRpcProvider({
    network: "mainnet",
    apiKey: "YOUR API KEY",
  });

  const handleConnectReload = async () => {
    setIsLoading(true);
    try {
      // Step 2: Fetch account balance
      const balance = await client.getAccountBalance(myTonAddress);
      setAccountBalance(balance);

      // Step 3: Fetch the latest transaction
      const transactions = await client.getTransactions({ account: myTonAddress });
      setLastTransaction(transactions[1] || "No transaction found");
    } catch (error) {
      setAccountBalance("Error fetching balance");
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
              <p>Get your API key on{" "}
                <a
                  href="https://dashboard.tonxapi.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
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
      </header>

      <h1>Get My TON Transactions</h1>

      <div className="card">
        <div className="mb-2">
          <h2>Balance</h2>
          <div className="transaction-container">
            <span className="transaction-hash">{accountBalance}</span>
          </div>
        </div>

        <div>
          <h2>Last Transaction</h2>
          <div className="transaction-container">
            {typeof lastTransaction === "object" && lastTransaction?.hash ? (
              <a
                href={`https://tonviewer.com/${lastTransaction.hash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {lastTransaction.hash}
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
        <button
          onClick={handleConnectReload}
          disabled={isLoading}
          className={`button ${isLoading ? 'loading' : ''}`}
        >
          {isLoading ? 'Loading...' : 'Connect & Reload'}
        </button>
      </div>
    </div>
  );
}