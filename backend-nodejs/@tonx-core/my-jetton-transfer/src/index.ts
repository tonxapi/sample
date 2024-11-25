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

interface JettonTransferParams {
    mnemonic: string[];
    amount: number;
    recipientAddress: string;
    jettonWalletAddress: string;
}

interface TransferResult {
    success: boolean;
    hash?: string;
    error?: string;
}

async function transferJettons(params: JettonTransferParams): Promise<TransferResult> {
    const {
        mnemonic,
        amount,
        recipientAddress,
        jettonWalletAddress,
    } = params;

    const provider = new TONXJsonRpcProvider({
        network: 'testnet',
        apiKey: 'YOUR_API_KEY',
    });

    console.log("Starting jetton transfer...");

    try {
        const keyPair = await mnemonicToPrivateKey(mnemonic);
        const wallet = WalletContractV4.create({
            workchain: 0,
            publicKey: Buffer.from(keyPair.publicKey)
        });

        const walletAddress = wallet.address.toString({
            urlSafe: true,
            bounceable: false,
        });

        console.log("Checking wallet deployment...");
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

        console.log("Creating jetton transfer message...");

        // Create comment payload
        const forwardPayload = beginCell()
            .storeUint(0, 32)
            .storeStringTail('')
            .endCell();

        // Create transfer message body
        const messageBody = beginCell()
            .storeUint(0xf8a7ea5, 32)
            .storeUint(0, 64)
            .storeCoins(BigInt(amount * 1000000)) // jetton amount
            .storeAddress(Address.parse(recipientAddress))
            .storeAddress(Address.parse(walletAddress))
            .storeBit(1)
            .storeCoins(1)
            .storeBit(0)
            .storeRef(forwardPayload)
            .endCell();

        // Create internal message
        const internalMessage = internal({
            to: Address.parse(jettonWalletAddress),
            value: toNano('0.05'),
            bounce: true,
            body: messageBody,
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

        console.log("Sending transaction...");
        const externalMessageCell = beginCell()
            .store(storeMessage(externalMessage))
            .endCell();

        const boc = externalMessageCell.toBoc().toString('base64');
        await provider.sendMessage(boc);

        const hash = externalMessageCell.hash().toString('hex');
        console.log("message hash:", hash);

        console.log("Transfer successful!");
        return {
            success: true,
            hash
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Transfer failed:', errorMessage);
        return {
            success: false,
            error: errorMessage
        };
    }
}

// Example usage
async function main() {
    const params: JettonTransferParams = {
        mnemonic: ['your', 'mnemonic', 'words', 'here'],
        amount: 10, // amount of jettons to transfer
        recipientAddress: '', // recipient TON address
        jettonWalletAddress: '', // your jetton wallet address

    };

    try {
        const result = await transferJettons(params);
        if (result.success) {
            console.log('Transaction completed with hash:', result.hash);
        } else {
            console.error('Transaction failed:', result.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

main().catch(console.error);
