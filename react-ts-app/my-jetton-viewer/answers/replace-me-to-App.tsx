"use client";
import { useState } from "react";
import "./App.css";
import { TONXJsonRpcProvider } from "@tonx/core";

interface Transaction {
  transaction_hash?: string;
  [key: string]: any;
}


export default function App() {
  const [accountBalance, setAccountBalance] = useState<string>("No connection");
  const [lastTransaction, setLastTransaction] = useState<Transaction | string>("No connection");
  const myUsdtAddress = "UQBm2-oK4u9CP56wS4LaPUWV-meDmNnSaD9Jlt-FyRHoBimJ";

  // Render a textarea component with dynamic values
  const renderTextArea = (label: string, value: string) => (
    <div style={{ marginBottom: "20px" }}>
      <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>{label}</label>
      <textarea
        value={value}
        readOnly
        style={{
          width: "300px",
          height: "100px",
          fontSize: "16px",
          textAlign: "center",
          marginBottom: "20px",
          resize: "none",
        }}
      />
    </div>
  );

  // Step 1: init TONX client
  const client = new TONXJsonRpcProvider({
    network: "mainnet",
    apiKey: "YOUR API KEY",
  });

  const handleConnectReload = async () => {
    try {
      // Step 2: Fetch the latest transfer-in
      const transactions = await client.getJettonTransfers({ address: myUsdtAddress, direction: "in" });
      setLastTransaction(transactions[0].transaction_hash || "No transaction found");

      // Step 3: Fetch USDT balance
      const balance = await client.getTokenData(transactions[0].source_wallet);
      setAccountBalance(balance.balance);
    } catch (error) {
      setAccountBalance("Error fetching balance");
      setLastTransaction("Error fetching transaction");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>3 Steps to TON</h1>
        <div style={{ marginBottom: "30px" }}>
          <p>
            Step 1: Get your API key on{" "}
            <a
              href="https://dashboard.tonxapi.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "16px", color: "#61dafb" }}
            >
              dashboard.tonxapi.com
            </a>
          </p>
          <p>Step 2: install TONX SDK</p>
          <p>Step 3: Enjoy!</p>
        </div>

        <hr />
        <h1>Get My USDT Lastest transfer-in</h1>
        {renderTextArea("Balance", accountBalance)}

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Last Transaction</label>
          {typeof lastTransaction === "object" && lastTransaction?.transaction_hash ? (
            <a
              href={`https://tonviewer.com/${lastTransaction.transaction_hash}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: "16px", color: "#61dafb" }}
            >
              {lastTransaction.transaction_hash}
            </a>
          ) : (
            <textarea
              value={typeof lastTransaction === "string" ? lastTransaction : "No transaction found"}
              readOnly
              style={{
                width: "300px",
                height: "100px",
                fontSize: "16px",
                textAlign: "center",
                marginBottom: "20px",
                resize: "none",
              }}
            />
          )}
        </div>

        <button
          onClick={handleConnectReload}
          style={{
            width: "200px",
            height: "40px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Connect & Reload
        </button>
      </header>
    </div>
  );
}