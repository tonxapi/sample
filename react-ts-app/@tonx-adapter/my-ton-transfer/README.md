# TON Simple Transfer Application

A React application that enables simple TON transfers using the TONX Adapter.

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

The application uses ToncoreAdapter configured for testnet:
```typescript
const client = new ToncoreAdapter({
  network: "testnet", // testnet or mainnet
  apiKey: import.meta.env.VITE_TONXAPI_KEY,
});
```

### Wallet Configuration

This application uses WalletContractV4. You need to:

1. Configure your mnemonic phrases:
```typescript
const mnemonic = ['your', 'mnemonic'];  // Replace with your mnemonic phrases
```

### API Key Setup

1. Get your API key from [dashboard.tonxapi.com](https://dashboard.tonxapi.com)
2. **Important**: Use a testnet API key

## Features

- Send fixed amount (0.1 TON) transfers
- Support for WalletContractV4
- Uses ToncoreAdapter for simplified contract interaction
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
2. Generate wallet contract
3. Create transfer message
4. Send transaction
5. Status updates

## Security Best Practices

1. Never commit mnemonics or API keys to version control
2. Validate all input addresses
3. Handle API errors appropriately

## Common Issues and Troubleshooting

1. **Transfer Failures**
   - Verify recipient address is valid
   - Ensure sufficient balance (more than 0.1 TON)
   - Check network connectivity

2. **API Key Issues**
   - Verify you're using a testnet API key
   - Ensure proper network connectivity

## Additional Resources

- [TONX API Documentation](https://docs.tonxapi.com)