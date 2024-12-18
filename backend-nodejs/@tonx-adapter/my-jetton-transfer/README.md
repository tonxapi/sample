# TON Jetton Transfer

A Node.js module for transferring Jettons using the TON Core SDK and TONX Adapter.

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

### Network Configuration

The module uses ToncoreAdapter configured for testnet:
```typescript
const client = new ToncoreAdapter({
    network: "testnet",
    apiKey: process.env.TONX_API_KEY,
});
```

### Transfer Configuration

The module accepts transfer parameters:
```typescript
interface JettonTransferParams {
    recipientAddress: string;    // Recipient's address
    amount: number;              // Amount of Jettons
    jettonMasterAddress: string; // Jetton master contract address
    mnemonic: string[];         // Your wallet mnemonic phrases
}
```

### API Key Setup

1. Get your API key from [dashboard.tonxapi.com](https://dashboard.tonxapi.com)
2. **Important**: Use a testnet API key

## Running the Application

Start Running the Application:
```bash
npm run dev
```

### Error Handling

The module handles several error cases:
- Contract deployment check
- Jetton wallet address derivation
- Message creation and sending
- Transaction verification

## Common Issues and Troubleshooting

1. **API Key Issues**
   - Verify you're using a testnet API key
   - Ensure proper environment variable setup
   - Check network connectivity

2. **Transfer Issues**
   - Verify recipient address format
   - Check Jetton master address
   - Ensure sufficient TON balance for fees

3. **Wallet Issues**
   - Confirm wallet deployment
   - Verify mnemonic phrases
   - Check contract version compatibility

## Additional Resources

- [TONX API Documentation](https://docs.tonxapi.com)