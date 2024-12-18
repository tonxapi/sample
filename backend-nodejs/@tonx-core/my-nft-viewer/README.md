# TON NFT Transfer

A Node.js class for checking NFT transfer history on the TON blockchain using the TONX SDK.

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
    network: "testnet", // testnet or mainnet
    apiKey: apiKey,
});
```

### NFT Configuration

Configure your NFT address:
```typescript
this.nftAddress = "EQAc4jcphnAeLQ_wmS7e4leWghFysRI_VKUCR0jhiVDX9hXn"; // change to what NFT you want
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
- API request failures

## Common Issues and Troubleshooting

1. **API Key Issues**
   - Verify you're using a testnet API key
   - Ensure proper environment variable setup
   - Check network connectivity

2. **NFT Issues**
   - Verify the NFT address is correct
   - Check if the NFT has any transfer history

## Additional Resources

- [TONX API Documentation](https://docs.tonxapi.com)