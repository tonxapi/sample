# NFT Transaction Viewer

A React application that displays the latest transfer transaction for a specified NFT address using the TONX SDK.

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

3. Create a `.env` file in the root directory:
```env
VITE_TONXAPI_KEY=your_testnet_api_key_here
```

## Important Configuration Notes

### Network Configuration

1. The application is configured for testnet use. Make sure to use the correct network setting:
```typescript
const client = new TONXJsonRpcProvider({
  network: "testnet", // Keep this as testnet for development
  apiKey: import.meta.env.VITE_TONXAPI_KEY,
});
```

### NFT Address Configuration

The application uses a default NFT address for tracking:
```typescript
const nftAddress = "EQAc4jcphnAeLQ_wmS7e4leWghFysRI_VKUCR0jhiVDX9hXn";
```

To track a different NFT:
1. Replace the `nftAddress` constant with your desired NFT address
2. Ensure the address is valid and exists on the testnet

### API Key Setup

1. Get your API key from [dashboard.tonxapi.com](https://dashboard.tonxapi.com)
2. **Important**: Use a testnet API key
3. Save it in your `.env` file as shown above

## TypeScript Interfaces

The application uses TypeScript for type safety. Key interfaces include:

```typescript
interface Transaction {
  transaction_hash?: string;
  [key: string]: unknown;
}
```

## Running the Application

1. Ensure your environment variables are set up:
```bash
cp .env.example .env
# Edit .env with your actual testnet API key
```

2. Start the development server:
```bash
pnpm dev
```

3. Open your browser and navigate to the local development server (usually `http://localhost:4000`)

## Features

- View the latest transfer transaction for a specified NFT
- Direct link to transaction details on TON Explorer
- Loading state handling
- Error state handling

## Transaction Viewing

The application provides two ways to view transaction information:

1. Direct hash display for non-clickable transactions
2. Clickable links to TON Explorer for valid transaction hashes

## Error Handling

The application handles several states:
- "No connection" - Initial state
- "Error fetching transaction" - When API calls fail
- "No transaction found" - When no transfers are found
- Valid transaction hash - Displays with link to explorer

## Security Best Practices

1. Never commit API keys to version control
2. Always use environment variables for sensitive data
3. Validate NFT addresses before querying
4. Handle API errors gracefully

## Common Issues and Troubleshooting

1. **API Key Issues**
   - Verify you're using a testnet API key
   - Check if the API key is properly set in your .env file
   - Ensure the environment variable is correctly accessed

2. **No Transactions Found**
   - Verify the NFT address is correct
   - Check if the NFT has any transfer history
   - Ensure you're connected to the correct network (testnet)

## Additional Resources

- [TONX API Documentation](https://docs.tonxapi.com)
