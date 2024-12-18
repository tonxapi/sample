# TON Blance Viewer

A Node.js class for checking TON account balance and transaction history using the TONX SDK.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- TypeScript knowledge for development

## Installation

Install dependencies:
```bash
npm install
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

### Account Configuration

Configure your TON address:
```typescript
private myTonAddress = "EQDi1eWU3HWWst8owY8OMq2Dz9nJJEHUROza8R-_wEGb8yu6"; // change to what address you want
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
- Balance fetch failure
- API request failures

## Common Issues and Troubleshooting

1. **API Key Issues**
   - Verify you're using a testnet API key
   - Ensure proper environment variable setup
   - Check network connectivity

2. **Balance Issues**
   - Verify the address is correct
   - Check if account exists on network

## Additional Resources

- [TONX API Documentation](https://docs.tonxapi.com)