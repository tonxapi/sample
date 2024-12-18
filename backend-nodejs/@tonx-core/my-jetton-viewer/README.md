# TON Jetton Balance

A Node.js class for checking Jetton balance and transaction history on the TON blockchain using the TONX SDK.

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

The checker is configured for testnet by default:
```typescript
const client = new TONXJsonRpcProvider({
    network: "testnet",
    apiKey: apiKey,
});
```

### Jetton Configuration

Configure your Jetton address:
```typescript
private myJettonAddress: string = "UQBm2-oK4u9CP56wS4LaPUWV-meDmNnSaD9Jlt-FyRHoBimJ"; // change to what Jetton you want
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

The class handles several error cases:
- No transaction found
- No source wallet found
- API request failures

## Common Issues and Troubleshooting

1. **API Key Issues**
   - Verify you're using a testnet API key
   - Ensure proper environment variable setup
   - Check network connectivity

2. **Balance Not Showing**
   - Verify the Jetton address is correct
   - Check if the wallet has any tokens
   - Ensure proper API responses

3. **Transaction History Issues**
   - Verify the Jetton has transfer history
   - Ensure source wallet is valid

## Additional Resources

- [TONX API Documentation](https://docs.tonxapi.com)