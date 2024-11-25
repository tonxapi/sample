import { useState } from "react";
import "./App.css";
import {
  beginCell,
  Address,
  WalletContractV4,
  internal,
  external,
  storeMessage,
  toNano,
} from '@ton/ton';
import { mnemonicToPrivateKey } from "@ton/crypto";
import { ToncoreAdapter } from "@tonx/adapter";

async function getUserJettonWalletAddress(
  client: ToncoreAdapter,
  userAddress: string,
  jettonMasterAddress: string
) {
  const userAddressCell = beginCell()
    .storeAddress(Address.parse(userAddress))
    .endCell();

  const response = await client.runMethod(
    Address.parse(jettonMasterAddress),
    'get_wallet_address',
    [{ type: 'slice', cell: userAddressCell }]
  );

  return response.stack.readAddress();
}

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [jettonMasterAddress, setJettonMasterAddress] = useState("");
  const [status, setStatus] = useState("");

  // Constants
  const mnemonic = ["your", 'mnemonic']
  const client = new ToncoreAdapter({
    network: "testnet",
    apiKey: "YOUR_API_KEY",
  });

  const handleTransfer = async () => {
    setIsLoading(true);
    setStatus("Starting transfer...");

    try {
      // Get keypair from mnemonic
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

      setStatus("Getting wallet information...");
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

      // Get jetton wallet address
      setStatus("Getting jetton wallet address...");
      const jettonWalletAddress = await getUserJettonWalletAddress(
        client,
        walletAddress,
        jettonMasterAddress
      );

      // Create comment payload
      const forwardPayload = beginCell()
        .storeUint(0, 32)
        .storeStringTail('transfer')
        .endCell();

      setStatus("Creating transfer message...");
      // Create transfer message body
      const messageBody = beginCell()
        .storeUint(0x0f8a7ea5, 32) // transfer op
        .storeUint(0, 64) // query id
        .storeCoins(Number(amount) * 1000000)
        .storeAddress(Address.parse(recipientAddress))
        .storeAddress(jettonWalletAddress) // response destination
        .storeBit(1)
        .storeCoins(toNano("0.05"))
        .storeBit(0)
        .storeRef(forwardPayload)
        .endCell();

      // Create internal message
      const internalMessage = internal({
        to: jettonWalletAddress,
        value: toNano('0.15'),
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
      console.log('message hash:', hash);
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
        <h1>TON Jetton Transfer</h1>

        <div className="card">
          <h2>Transfer Jettons</h2>
          <div className="input-container">
            <input
              type="text"
              placeholder="Jetton Master Address (e.g., USDT contract)"
              value={jettonMasterAddress}
              onChange={(e) => setJettonMasterAddress(e.target.value)}
              disabled={isLoading}
            />
            <input
              type="text"
              placeholder="Recipient Address"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              disabled={isLoading}
            />
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isLoading}
            />
            <button
              onClick={handleTransfer}
              disabled={isLoading || !amount || !recipientAddress || !jettonMasterAddress}
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
      </header>
    </div>
  );
}