# TON Jetton Transaction Viewer

A React application that displays Jetton balances and latest transaction history using the TONX Adapter.

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

### Jetton Configuration

Configure your Jetton address:
```typescript
const myJettonAddress = Address.parse("UQBv3exBKLmQcn2Fm6VlntAInW-je1YP4U59gJxaO62NCyMn"); // change to what Jetton you want
```

### API Key Setup

1. Get your API key from [dashboard.tonxapi.com](https://dashboard.tonxapi.com)
2. **Important**: Use a testnet API key

## Features

- View Jetton token balance
- Display latest incoming transaction
- Transaction explorer integration
- Error handling and validation
- Loading state management

## Running the Application

Start the development server:
```bash
pnpm dev
```

Access the application (usually at `http://localhost:4000`)

## Component Functionality

### Data Fetching Process
1. Fetch latest transaction with a limit of 1
2. Fetch current Jetton balance
3. Display transaction hash with explorer link
4. Status updates and error handling

## Security Best Practices

1. Never commit API keys to version control
2. Validate all addresses
3. Handle API errors appropriately

## Common Issues and Troubleshooting

1. **Balance Not Showing**
   - Verify the Jetton address is correct
   - Check if the wallet has any Jetton tokens
   - Ensure proper network connectivity

2. **Transaction History Issues**
   - Verify the Jetton has transfer history
   - Check if the address format is valid
   - Ensure proper address encoding/decoding

3. **API Key Issues**
   - Verify you're using a testnet API key
   - Ensure proper network connectivity

## Additional Resources

- [TONX API Documentation](https://docs.tonxapi.com)
