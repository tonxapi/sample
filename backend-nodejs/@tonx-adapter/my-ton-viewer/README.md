# TON Account Checker

A Node.js class for checking TON account balance and transactions using the TON Core Adapter.

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

The checker uses ToncoreAdapter configured for testnet:
```typescript
const client = new ToncoreAdapter({
    network: "testnet",
    apiKey: process.env.TONX_API_KEY,
});
```

### Account Configuration

Initialize the checker with address:
```typescript
const checker = new TONChecker(apiKey, "EQBi5X1kwa27gqKn2MztaEZz7Zkhvb_WlSif-CnIiUjwuLEG");
```

### Response Format

The checker returns data in the following format:
```typescript
interface TONCheckResult {
    balance: string;
    lastTransaction: Transaction | string;
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

The class handles several error cases:
- Balance fetch failures
- Transaction retrieval errors
- Invalid address format
- API request failures

## Common Issues and Troubleshooting

1. **API Key Issues**
   - Verify you're using a testnet API key
   - Ensure proper environment variable setup
   - Check network connectivity

2. **Address Issues**
   - Verify address format is correct
   - Check if address exists on network
   - Ensure proper address parsing

## Additional Resources

- [TONX API Documentation](https://docs.tonxapi.com)