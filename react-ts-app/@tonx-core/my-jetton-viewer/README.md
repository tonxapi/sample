# TON Jetton Transfer Viewer

A React application that displays Jetton balances and transfer history using the TONX SDK.

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

### Jetton Configuration

Configure your Jetton address for tracking:
```typescript
const myJettonAddress = "UQBm2-oK4u9CP56wS4LaPUWV-meDmNnSaD9Jlt-FyRHoBimJ"; // change to what Jetton you want
```

### API Key Setup

1. Get your API key from [dashboard.tonxapi.com](https://dashboard.tonxapi.com)
2. **Important**: Use a testnet API key

## Features

- View Jetton token balance
- Display latest incoming transfer history
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
1. Fetch latest transfer-in transactions
2. Fetch Jetton balance from source wallet
3. Update display with fetched data
4. Handle loading states and errors

## Security Best Practices

1. Never commit API keys to version control
2. Validate all addresses
3. Handle API errors appropriately

## Common Issues and Troubleshooting

1. **Balance Not Showing**
   - Verify the Jetton address is correct
   - Check if the source wallet has any Jetton tokens
   - Ensure proper network connectivity

2. **Transaction History Issues**
   - Verify the Jetton has transfer history
   - Check if using correct direction parameter ("in")
   - Ensure source wallet is valid

3. **API Key Issues**
   - Verify you're using a testnet API key
   - Ensure proper network connectivity

## Additional Resources

- [TONX API Documentation](https://docs.tonxapi.com)
