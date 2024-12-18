# TON Transfer

A Node.js module for transferring TON on the blockchain using the TONX SDK.

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

The module is configured for testnet by default:
```typescript
const provider = new TONXJsonRpcProvider({
    network: "testnet",
    apiKey: process.env.TONX_API_KEY,
});
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
- Wallet not deployed
- Invalid recipient address
- Insufficient balance
- API request failures

## Common Issues and Troubleshooting

1. **API Key Issues**
   - Verify you're using a testnet API key
   - Ensure proper environment variable setup
   - Check network connectivity

2. **Transfer Issues**
   - Verify recipient address format
   - Check sufficient balance
   - Ensure proper amount format

3. **Wallet Issues**
   - Confirm wallet deployment
   - Verify mnemonic phrases
   - Check wallet version

## Additional Resources

- [TONX API Documentation](https://docs.tonxapi.com)