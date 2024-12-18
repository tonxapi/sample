# TON Jetton Transfer

A Node.js module for transferring Jetton tokens on the TON blockchain using the TONX SDK.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- TypeScript knowledge for development

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up your environment variables in `.env`:
```env
TONX_API_KEY=your_testnet_api_key_here
```

## Important Configuration Notes

### Wallet Version Configuration

The module uses WalletContractV4 by default. You can change the wallet version according to your needs:
```typescript
// Import your desired wallet version
import { WalletContractV4 } from '@ton/ton';

// Then use it in the code
const wallet = WalletContractV4.create({  // Change to your wallet version
    workchain: 0,
    publicKey: Buffer.from(keyPair.publicKey)
});
```

### Network Configuration

The module is configured for testnet by default:
```typescript
const provider = new TONXJsonRpcProvider({
  network: "testnet", //testnet or mainnnet
  apiKey: process.env.TONX_API_KEY as string
});
```

## Running the Application

Start Running the Application:
```bash
npm run dev
```

## Important Notes

1. **Wallet Configuration**
   - Select the appropriate wallet contract version (V3, V3R2, or V4)
   - Make sure the wallet version matches your deployed wallet
   - Different wallet versions may have different features and requirements

2. **Wallet Deployment**
   - The wallet must be deployed before attempting transfers
   - The module checks deployment status automatically

3. **Amount Conversion**
   - The amount parameter is automatically multiplied by 10^6
   - Example: amount: 10 = 10,000,000 token units

## Security Best Practices

1. Never commit mnemonics or API keys to version control
2. Store sensitive data in environment variables
3. Validate all input addresses
4. Implement proper error handling

## Common Issues and Troubleshooting

1. **Wallet Version Issues**
   - Ensure you're using the correct wallet contract version
   - Check if your wallet was deployed with the same version
   - Verify compatibility with your TON wallet

2. **Wallet Not Deployed Error**
   - Ensure your wallet is properly deployed on testnet
   - Verify mnemonic phrases are correct
   - Check if you have sufficient balance for deployment

3. **Transfer Failures**
   - Verify Jetton wallet address is correct
   - Ensure recipient address is valid
   - Check if amount is within valid range

4. **API Key Issues**
   - Verify you're using a testnet API key
   - Ensure proper environment variable setup
   - Check network connectivity

## Additional Resources

- [TONX API Documentation](https://docs.tonxapi.com)