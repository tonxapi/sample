import {
    Address,
    WalletContractV4,
    internal,
    external,
    storeMessage,
    beginCell,
    toNano,
    WalletContractV3R2
} from '@ton/ton';
import { mnemonicToPrivateKey } from "@ton/crypto";
import { ToncoreAdapter } from '@tonx/adapter'

interface TonTransferParams {
    recipientAddress: string;
    amount: string;  // in TON (e.g., "0.1" for 0.1 TON)
    comment?: string;
    mnemonic: string[];
}

async function transferTon({
    recipientAddress,
    amount,
    comment,
    mnemonic
}: TonTransferParams): Promise<string> {
    // Initialize client
    const client = new ToncoreAdapter({
        network: "testnet",
        apiKey: "YOUR_API_KEY",
    });

    try {
        // Generate wallet from mnemonic
        const keypair = await mnemonicToPrivateKey(mnemonic);
        const wallet = WalletContractV3R2.create({
            workchain: 0,
            publicKey: keypair.publicKey,
        });

        // Open contract
        const contract = client.open(wallet);

        // Create transfer message
        const seqno = await contract.getSeqno();
        const transfer = await contract.createTransfer({
            seqno,
            secretKey: keypair.secretKey,
            messages: [
                internal({
                    to: Address.parse(recipientAddress),
                    value: amount,
                    bounce: false,
                    body: comment || "", // Optional comment
                })
            ],
        });

        // Send transaction
        const result = await contract.send(transfer);
        console.log("Transfer sent:", result);
        return "success";

    } catch (error) {
        console.error("Transfer failed:", error);
        throw error;
    }
}

// Example usage
const exampleTransfer = async () => {
    const params: TonTransferParams = {
        recipientAddress: '', // Recipient address
        amount: '0.1', // Amount in TON
        comment: 'Payment for services', // Optional comment
        mnemonic: ["your", "mnemonics"]
    };

    try {
        const txHash = await transferTon(params);
        console.log('Transfer initiated, hash:', txHash);

        if (params.comment) {
            console.log('Comment:', params.comment);
        }
    } catch (error) {
        console.error('Transfer failed:', error);
    }
};

exampleTransfer();