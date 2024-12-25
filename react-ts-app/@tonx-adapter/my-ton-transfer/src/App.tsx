import { useState } from "react";
import "./App.css";
import {
  beginCell,
  WalletContractV4, // change to your wallet version
  internal,
  external,
  storeMessage,
} from "@ton/ton";
import { ToncoreAdapter } from "@tonx/adapter";
import { mnemonicToPrivateKey } from "@ton/crypto";

interface TextInputProps {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}

// Input Component
const TextInput: React.FC<TextInputProps> = ({ label, value, onChange, disabled }) => (
  <div className="input-wrapper">
    <label className="input-label">{label}</label>
    <input type="text" value={value} onChange={onChange} disabled={disabled} className="input-field" />
  </div>
);
export default function App() {
  const [destination, setDestination] = useState<string>("Dest. Address");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");

  // Initialize TONX client
  const client = new ToncoreAdapter({
    network: "testnet", // testnet or mainnet
    apiKey: import.meta.env.VITE_TONXAPI_KEY,
  });

  const handleTransfer = async () => {
    setIsLoading(true);
    setStatus("Starting transfer...");

    try {
      // Generate wallet contract
      const mnemonics = ["your", "mnemonic"];

      setStatus("Generating wallet contract...");
      const keypair = await mnemonicToPrivateKey(mnemonics);
      const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: keypair.publicKey,
      });
      const contract = client.open(wallet);

      setStatus("Creating transfer...");
      // Create and send transfer
      const seqno = await contract.getSeqno();
      const transfer = await contract.createTransfer({
        seqno,
        secretKey: keypair.secretKey,
        messages: [
          internal({
            value: "0.1",
            to: destination,
            body: "sent by tonxapi.com",
          }),
        ],
      });
      console.log("Transfer:", transfer);

      setStatus("Sending transaction...");
      const result = await contract.send(transfer);

      const hash = beginCell()
        .store(storeMessage(external({ to: contract.address, body: transfer })))
        .endCell();
      console.log("message hash:", hash);

      setStatus("Transfer successful!");
      setDestination("Sending 0.1 TON");
    } catch (error) {
      console.error("Error Sending TON:", error);
      setStatus(`Transfer failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>3 Steps to Transfer TON </h1>
        <div className="card">
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <p>
                Get your API key from{" "}
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

        <div className="card">
          <h2>Send 0.1 TON</h2>
          <div className="input-container">
            <TextInput
              label="Destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              disabled={isLoading}
            />
            <button onClick={handleTransfer} disabled={isLoading} className={`button ${isLoading ? "loading" : ""}`}>
              {isLoading ? "Processing..." : "Connect & Send"}
            </button>
          </div>
          {status && (
            <div className="status-container">
              <p>{status}</p>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}
