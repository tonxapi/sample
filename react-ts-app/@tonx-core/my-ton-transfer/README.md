# TON Transfer Application

A React application that enables TON transfers using the TONX SDK.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [pnpm](https://pnpm.io/) package manager
- TypeScript knowledge for development

## Environment Setup

1. Install pnpm globally:
```bash
npm install -g pnpm
```

2. Install project dependencies:
```bash
pnpm install
```

## Important Configuration Notes

### Network Configuration

1. The application is configured for testnet use. Ensure correct network setting:
```typescript
const provider = new TONXJsonRpcProvider({
  network: "testnet", // Keep this as testnet for development
  apiKey: import.meta.env.VITE_TONXAPI_KEY,
});
```

### Wallet Configuration

This application uses WalletContractV4. You need to:

1. Configure your mnemonic phrases:
```typescript
const MNEMONIC = ['your', 'mnemonic'];  // Replace with your mnemonic phrases
```

2. **Important**: The wallet must be deployed before attempting transfers
```typescript
if (!contractDeployed) {
  throw new Error("Wallet not deployed");
}
```

### API Key Setup

1. Get your API key from [dashboard.tonxapi.com](https://dashboard.tonxapi.com)
2. **Important**: Use a testnet API key

## Features

- Transfer TON between addresses
- Support for WalletContractV4
- Real-time transfer status updates
- Error handling and validation
- Loading state management

## Running the Application

Start the development server:
```bash
pnpm dev
```

Access the application (usually at `http://localhost:4000`)

## Component Functionality

### Transfer Process
1. Input validation
2. Wallet deployment check
3. Transfer message creation
4. Transaction execution
5. Status updates

## Security Best Practices

1. Never commit mnemonics or API keys to version control
2. Validate all input addresses
3. Handle API errors appropriately
4. Implement proper error handling for failed transfers

## Common Issues and Troubleshooting

1. **Wallet Not Deployed Error**
   - Ensure your wallet is properly deployed on testnet
   - Verify mnemonic phrases are correct
   - Check if you have sufficient balance for deployment

2. **Transfer Failures**
   - Verify recipient address is valid
   - Ensure sufficient balance for transfer
   - Check if amount is within valid range

3. **API Key Issues**
   - Verify you're using a testnet API key
   - Ensure proper network connectivity

## Additional Resources

- [TONX API Documentation](https://docs.tonxapi.com)
