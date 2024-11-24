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

interface NFTTransferParams {
    mnemonic: string[];
    nftAddress: string;
    recipientAddress: string;
}

interface TransferResult {
    success: boolean;
    hash?: string;
    error?: string;
}

async function transferNFT(params: NFTTransferParams): Promise<TransferResult> {
    const {
        mnemonic,
        nftAddress,
        recipientAddress,
    } = params;

    const provider = new TONXJsonRpcProvider({
        network: 'testnet',
        apiKey: 'YOUR_API_KEY'
    });

    console.log("Starting NFT transfer...");

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

        console.log("Creating NFT transfer message...");
        const messageBody = beginCell()
            .storeUint(0x5fcc3d14, 32) // transfer op code (TEP-62)
            .storeUint(Date.now(), 64) // query_id
            .storeAddress(Address.parse(recipientAddress)) // new_owner
            .storeAddress(Address.parse(walletAddress)) // response_destination
            .storeBit(0) // no custom_payload
            .storeCoins(toNano('0.01')) // forward_amount
            .storeBit(0)
            .endCell();

        const internalMessage = internal({
            to: Address.parse(nftAddress),
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
        console.log("Transfer successful!");
        console.log("Transaction hash:", hash);

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
    const params: NFTTransferParams = {
        mnemonic: ['your', 'mnemonic', 'words', 'here'],
        nftAddress: 'EQB...', // NFT contract address
        recipientAddress: 'EQB...', // recipient TON address
    };

    try {
        const result = await transferNFT(params);
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
