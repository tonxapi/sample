import {
    beginCell,
    Address,
    TonClient,
    WalletContractV4, // change to your wallet version
    internal,
    external,
    storeMessage,
    toNano
} from '@ton/ton';
import { mnemonicToPrivateKey } from "@ton/crypto";
import { ToncoreAdapter } from '@tonx/adapter'

interface JettonTransferParams {
    recipientAddress: string;
    amount: number;
    jettonMasterAddress: string;
    mnemonic: string[];
}

async function getUserJettonWalletAddress(
    client: TonClient,
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

async function transferJettons({
    recipientAddress,
    amount,
    jettonMasterAddress,
    mnemonic
}: JettonTransferParams): Promise<string> {
    const client = new ToncoreAdapter({
        network: 'testnet', // testnet or mainnet
        apiKey: process.env.TONX_API_KEY as string,
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

    // Check deployment status
    const { init } = wallet;
    const contractDeployed = await client.isContractDeployed(Address.parse(walletAddress));
    const neededInit = (!contractDeployed && init) ? init : null;

    // Get seqno using runMethod
    const seqno = contractDeployed
        ? await client.runMethod(Address.parse(walletAddress), 'seqno').then(res => res.stack.readNumber())
        : 0;

    // Get jetton wallet address
    const jettonWalletAddress = await getUserJettonWalletAddress(
        client,
        walletAddress,
        jettonMasterAddress
    );

    // Create comment payload
    const forwardPayload = beginCell()
        .storeUint(0, 32)
        .storeStringTail('')
        .endCell();



    // Create transfer message body
    const messageBody = beginCell()
        .storeUint(0x0f8a7ea5, 32) // transfer op
        .storeUint(0, 64) // query id
        .storeCoins((amount) * 1000000)
        .storeAddress(Address.parse(recipientAddress))
        .storeAddress(jettonWalletAddress) // response destination
        .storeBit(1)
        .storeCoins(1)
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
    const params: JettonTransferParams = {
        recipientAddress: '', // recipientAddress
        amount: 1,
        jettonMasterAddress: '', // Jetton master address
        mnemonic: ['your', 'mnemonics']
    };

    try {
        const txHash = await transferJettons(params);
        console.log('Transaction hash:', txHash);
    } catch (error) {
        console.error('Transfer failed:', error);
    }
};

exampleTransfer();