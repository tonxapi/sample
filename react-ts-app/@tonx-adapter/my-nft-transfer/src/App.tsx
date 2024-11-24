import { useState } from "react";
import "./App.css";
import {
  beginCell,
  Address,
  WalletContractV4,
  internal,
  external,
  storeMessage,
  toNano
} from '@ton/ton';
import { mnemonicToPrivateKey } from "@ton/crypto";
import { ToncoreAdapter } from "@tonx/adapter";

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [nftAddress, setNftAddress] = useState("");
  const [status, setStatus] = useState("");

  const mnemonic = ["your", "mnemonic"]
  const client = new ToncoreAdapter({
    network: "testnet",
    apiKey: "YOUR_API_KEY"
  });

  const handleTransfer = async () => {
    setIsLoading(true);
    setStatus("Starting NFT transfer...");

    try {
      const keyPair = await mnemonicToPrivateKey(mnemonic);
      const secretKey = Buffer.from(keyPair.secretKey);
      const publicKey = Buffer.from(keyPair.publicKey);

      // Initialize wallet
      const wallet = WalletContractV4.create({
        workchain: 0,
        publicKey
      });
      const walletAddress = wallet.address.toString({
        urlSafe: true,
        bounceable: false,
      });

      setStatus("Checking wallet deployment...");
      // Check deployment status
      const { init } = wallet;
      const contractDeployed = await client.isContractDeployed(Address.parse(walletAddress));
      const neededInit = (!contractDeployed && init) ? init : null;

      if (!contractDeployed) {
        throw new Error("Wallet not deployed");
      }

      // Get seqno
      const seqno = await client.runMethod(Address.parse(walletAddress), 'seqno')
        .then(res => res.stack.readNumber());

      setStatus("Creating NFT transfer message...");
      // Create NFT transfer message
      const messageBody = beginCell()
        .storeUint(0x5fcc3d14, 32) // transfer OP code (TEP-62)
        .storeUint(Date.now(), 64) // query_id
        .storeAddress(Address.parse(recipientAddress)) // new_owner
        .storeAddress(Address.parse(walletAddress)) // response_destination
        .storeBit(0) // no custom_payload
        .storeCoins(toNano('0.01')) // forward_amount
        .storeBit(0) // no forward_payload
        .endCell();

      // Create internal message
      const internalMessage = internal({
        to: Address.parse(nftAddress),
        value: toNano('0.05'),
        bounce: true,
        body: messageBody,
      });

      // Create external message
      const externalMessage = external({
        to: walletAddress,
        init: neededInit,
        body: wallet.createTransfer({
          seqno,
          secretKey,
          messages: [internalMessage],
        }),
      });

      setStatus("Sending transaction...");
      // Send transaction
      const externalMessageCell = beginCell()
        .store(storeMessage(externalMessage))
        .endCell();

      const signedTransaction = externalMessageCell.toBoc();
      await client.sendFile(signedTransaction);

      const hash = externalMessageCell.hash().toString('hex');
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
        <h1>TON NFT Transfer</h1>

        <div className="card">
          <h2>Transfer NFT</h2>
          <div className="input-container">
            <input
              type="text"
              placeholder="NFT Address (Item contract address)"
              value={nftAddress}
              onChange={(e) => setNftAddress(e.target.value)}
              disabled={isLoading}
            />
            <input
              type="text"
              placeholder="Recipient Address"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              disabled={isLoading}
            />
            <button
              onClick={handleTransfer}
              disabled={isLoading || !recipientAddress || !nftAddress}
              className={`button ${isLoading ? "loading" : ""}`}
            >
              {isLoading ? "Processing..." : "Transfer NFT"}
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