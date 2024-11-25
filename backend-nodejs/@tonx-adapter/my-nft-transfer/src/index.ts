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
import { ToncoreAdapter } from '@tonx/adapter'

interface NFTTransferParams {
    recipientAddress: string;
    nftAddress: string;
    mnemonic: string[];
}

async function transferNFT({
    recipientAddress,
    nftAddress,
    mnemonic
}: NFTTransferParams): Promise<string> {
    const client = new ToncoreAdapter({
        network: 'testnet',
        apiKey: "YOUR_API_KEY",
    });

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

    // Check deployment status and get seqno
    const { init } = wallet;
    const contractDeployed = await client.isContractDeployed(Address.parse(walletAddress));
    const neededInit = (!contractDeployed && init) ? init : null;

    const seqno = contractDeployed
        ? await client.runMethod(Address.parse(walletAddress), 'seqno').then(res => res.stack.readNumber())
        : 0;

    // Create NFT transfer message body according to TEP-62
    const messageBody = beginCell()
        .storeUint(0x5fcc3d14, 32)  // transfer OP code (TEP-62)
        .storeUint(Date.now(), 64)   // query_id
        .storeAddress(Address.parse(recipientAddress))  // new_owner
        .storeAddress(Address.parse(walletAddress))     // response_destination
        .storeBit(0)                 // no custom_payload
        .storeCoins(toNano('0.01'))  // forward_amount (recommended 0.01 TON for notification)
        .storeBit(0)                 // no forward_payload
        .endCell();

    // Create internal message
    const internalMessage = internal({
        to: Address.parse(nftAddress),
        value: toNano('0.05'),      // transaction fees
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

    // Send transaction
    const externalMessageCell = beginCell()
        .store(storeMessage(externalMessage))
        .endCell();

    const signedTransaction = externalMessageCell.toBoc();
    await client.sendFile(signedTransaction);

    const hash = externalMessageCell.hash().toString('hex');
    console.log('message hash:', hash);
    return hash;
}

// Example usage
const exampleTransfer = async () => {
    const params: NFTTransferParams = {
        recipientAddress: 'EQB...', // Recipient address
        nftAddress: 'EQB...', // NFT Item contract address
        mnemonic: ["word1", "word2", "..."] // Your wallet mnemonic
    };

    try {
        const txHash = await transferNFT(params);
        console.log('NFT transfer initiated, hash:', txHash);
    } catch (error) {
        console.error('Transfer failed:', error);
    }
};

exampleTransfer();