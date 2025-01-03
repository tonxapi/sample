# TON Jetton Transfer Application

A React application for transferring tgBTC Jettons on TON blockchain using the TONX SDK and TonConnect.

## Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [pnpm](https://pnpm.io/) package manager
- A TON wallet (Tonkeeper, OpenMask, etc.)
- An account on [TONX API](https://dashboard.tonxapi.com) for API key

## Environment Setup

1. Install dependencies:
```bash
npm install -g pnpm
```
2. Install project dependencies:
```bash
pnpm install
```

3. Create a `.env` file in the root directory:
```env
VITE_TONXAPI_KEY=your_api_key_here
```

## Configuration

### Network Settings
The application is configured for testnet:
```typescript
const client = new TONXJsonRpcProvider({
  network: 'testnet',
  apiKey: import.meta.env.VITE_TONXAPI_KEY
});
```

## Features

- Connect TON wallet using TonConnect
- View tgBTC balance
- Transfer tgBTC to other addresses
- Real-time transaction confirmation
- Loading and success states
- User-friendly error handling

## Running the Application

1. Start the development server:
```bash
pnpm dev
```

2. Access the application (default: `http://localhost:4000`)

## Common Issues and Solutions

1. **Transaction Not Confirming**
   - Check if recipient address is valid
   - Ensure sufficient TON balance for fees
   - Verify tgBTC balance is sufficient

2. **API Issues**
   - Confirm API key is valid
   - Check network connection
   - Verify testnet configuration

3. **Wallet Connection Issues**
   - Ensure wallet is installed
   - Check if wallet supports testnet
   - Verify wallet has sufficient balance

## Additional Resources

- [TONX API Documentation](https://docs.tonxapi.com)
