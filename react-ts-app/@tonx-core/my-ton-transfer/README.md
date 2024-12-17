# TONX API TON Transfer Application

This application demonstrates how to implement TON transfers using the TONX SDK in a React environment.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [pnpm](https://pnpm.io/) package manager

## Environment Setup

1. Install pnpm if you haven't already:
```bash
npm install -g pnpm
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env` file in the root directory:
```env
VITE_TONXAPI_KEY=your_testnet_api_key_here
```

## Important Configuration Notes

### Wallet Configuration

1. This application uses **WalletContractV4**. Make sure you're using the correct wallet version:
```javascript
import { WalletContractV4 } from '@ton/ton';
```

2. Mnemonic Setup:
```javascript
// Replace with your actual mnemonic phrases
const MNEMONIC = ["word1", "word2", "word3", ... "word24"];
```

### API Key Configuration

1. Get your API key from [dashboard.tonxapi.com](https://dashboard.tonxapi.com)
2. **Important**: This application is configured for the testnet. Make sure to use a testnet API key, not a mainnet key.

### Wallet Initialization Requirement

⚠️ **Critical**: The wallet must be initialized before attempting any transfers.

- The application checks for wallet deployment before processing transfers
- Uninitiated wallets will result in a 400 error
- Make sure to deploy and initialize your wallet before using it for transfers

Example wallet deployment check in the code:
```javascript
const contractDeployed = await provider.getAddressState(walletAddress);
if (!contractDeployed) {
  throw new Error("Wallet not deployed");
}
```

## Security Best Practices

1. Never commit your mnemonic phrases or API keys to version control
2. Store sensitive information in environment variables
3. Use the `.env` file for local development:
```javascript
// Access API key safely from environment variables
apiKey: import.meta.env.VITE_TONXAPI_KEY
```

## Running the Application

1. Start the development server:
```bash
pnpm dev
```

## Common Issues and Troubleshooting

1. **400 Error on Transfer**
   - Check if your wallet is properly initialized
   - Verify your wallet version matches WalletContractV4
   - Ensure sufficient balance for the transfer

2. **API Key Issues**
   - Verify you're using a testnet API key
   - Check if the API key is properly set in your .env file
   - Ensure the environment variable is correctly accessed in the code

## Additional Resources

- [TONX API Documentation](https://docs.tonxapi.com)
