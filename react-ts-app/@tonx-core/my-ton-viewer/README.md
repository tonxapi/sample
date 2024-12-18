# TON Balance and Transaction Viewer

A React application that displays TON wallet balance and latest transactions using the TONX SDK.

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
const client = new TONXJsonRpcProvider({
  network: "testnet", // Keep this as testnet for development
  apiKey: import.meta.env.VITE_TONXAPI_KEY,
});
```

### Wallet Address Configuration

The application uses a default wallet address for tracking:
```typescript
const myTonAddress = "EQDi1eWU3HWWst8owY8OMq2Dz9nJJEHUROza8R-_wEGb8yu6";
```

To track a different wallet:
1. Replace the `myTonAddress` constant with your desired wallet address
2. Ensure the address is valid and exists on the testnet

### API Key Setup

1. Get your API key from [dashboard.tonxapi.com](https://dashboard.tonxapi.com)
2. **Important**: Use a testnet API key

## Features

- View wallet balance in TON
- Display latest transaction details
- Direct link to transaction explorer
- Loading state handling
- Error state handling

## Running the Application

Start the development server:
```bash
pnpm dev
```

Access the application (usually at `http://localhost:4000`)

## Component Functionality

The application provides several key features:

### Balance Display
- Shows current wallet balance
- Updates on refresh
- Handles error states gracefully

### Transaction Viewing
- Displays latest transaction hash
- Provides clickable links to TON Explorer
- Shows appropriate messages for different states

## Error States

The application handles multiple states:
- "No connection" - Initial state
- "Error fetching balance" - Balance fetch failure
- "Error fetching transaction" - Transaction fetch failure
- "No transaction found" - When no transactions exist
- Valid transaction hash - Displays with explorer link

## Security Best Practices

1. Never commit API keys to version control
2. Validate wallet addresses before querying
3. Handle API errors appropriately

## Common Issues and Troubleshooting

1. **API Key Issues**
   - Verify you're using a testnet API key
   - Ensure the environment variable is correctly accessed

2. **Balance Not Showing**
   - Verify the wallet address is correct
   - Check if the wallet exists on testnet
   - Ensure you have proper network connectivity

3. **Transactions Not Loading**
   - Verify the wallet has transaction history
   - Check network connection
   - Confirm API key permissions

## Additional Resources

- [TONX API Documentation](https://docs.tonxapi.com)
