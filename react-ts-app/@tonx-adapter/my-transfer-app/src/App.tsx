"use client";
import { useState } from "react";
import "./App.css";
import { WalletContractV4, internal } from "@ton/ton";
import { ToncoreAdapter } from "@tonx/adapter";
import { mnemonicToPrivateKey } from "@ton/crypto";

// Input Component
const TextInput = ({ label, value, onChange }) => (
  <div style={{ marginBottom: "20px" }}>
    <label style={styles.label}>{label}</label>
    <input
      type="text"
      value={value}
      onChange={onChange}
      style={styles.input}
    />
  </div>
);

const styles = {
  label: { display: "block", marginBottom: "5px", fontWeight: "bold" },
  input: {
    width: "300px",
    height: "30px",
    fontSize: "16px",
    textAlign: "center",
    marginBottom: "20px",
  },
  button: {
    width: "200px",
    height: "40px",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default function App() {
  const [destination, setDestination] = useState<string>("Dest. Address");

  // Initialize TONX client
  // Implement the "client" function
  
  const handleConnectReload = async () => {
    try {
      // Generate wallet contract
      const mnemonics = ["your", "mnemonics"];
      const keypair = await mnemonicToPrivateKey(mnemonics);
      const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: keypair.publicKey,
      });
      const contract = client.open(wallet);

      // Create and send transfer
      const seqno = await contract.getSeqno();
      const transfer = await contract.createTransfer({
        seqno,
        secretKey: keypair.secretKey,
        messages: [internal({
          value: "0.1",
          to: destination,
          body: "Hello world",
        })],
      });
      
      const result = await contract.send(transfer);
      console.log("Result:", result);
    } catch (error) {
      console.error("Error Sending TON:", error);
      setDestination("Error Sending TON");
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
        <h1>Send 0.1 TON</h1>
        <TextInput label="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} />

        <button onClick={handleConnectReload} style={styles.button}>
          Connect & Send
        </button>
      </header>
    </div>
  );
}
