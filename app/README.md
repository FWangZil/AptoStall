# AptoStall DApp

A minimal but production-grade front-end for the Kiosk-style fixed-price marketplace smart contract on Aptos testnet.

## 🚀 Features

- **Wallet Integration**: Connect with Petra wallet
- **Kiosk Management**: Create and manage your marketplace kiosk
- **Item Listing**: List objects for sale at fixed prices
- **Purchase Items**: Buy items from the marketplace
- **Real-time Updates**: Live balance and listing updates
- **Responsive Design**: Works on desktop and mobile

## 🛠️ Tech Stack

- **Framework**: React + TypeScript + Vite
- **UI**: shadcn/ui (Tailwind CSS)
- **Wallet**: @aptos-labs/wallet-adapter-react
- **Blockchain**: @aptos-labs/ts-sdk
- **State Management**: @tanstack/react-query
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 18+ or Bun
- Petra Wallet browser extension
- APT tokens on testnet (from faucet)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Using bun (recommended)
bun install

# Or using npm
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your contract address
VITE_APTOS_NODE_URL=https://fullnode.testnet.aptoslabs.com/v1
VITE_APTOS_NETWORK=testnet
VITE_MODULE_ADDRESS=0x42  # Replace with your deployed contract address
```

### 3. Development

```bash
# Start development server
bun dev

# Or with npm
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
# Build the app
bun build

# Preview production build
bun preview
```

## 📱 Usage Guide

### 1. Connect Wallet
- Click "Connect Wallet" in the header
- Approve connection in Petra wallet
- Your address and APT balance will be displayed

### 2. Create Kiosk
- Enter a unique seed for your stall
- Click "Create Kiosk"
- Approve the transaction in your wallet
- Your stall address will be saved locally

### 3. List Items
- Enter the object ID you want to sell
- Set a price in APT
- Click "List Item"
- Approve the transaction

### 4. Buy Items
- Browse available items in the marketplace table
- Click "Buy" next to any item
- Approve the transaction with exact payment amount

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── Header.tsx          # Navigation with wallet connection
│   ├── KioskSummaryCard.tsx # Kiosk creation and info
│   ├── ListItemForm.tsx    # Form to list new items
│   ├── ListingTable.tsx    # Table of available items
│   └── Toaster.tsx         # Toast notifications
├── hooks/
│   ├── useAptos.ts         # Aptos SDK client
│   ├── useKiosk.ts         # Kiosk operations
│   └── useToast.ts         # Toast notifications
├── pages/
│   └── Dashboard.tsx       # Main dashboard page
├── utils/
│   └── constants.ts        # Contract addresses and constants
├── lib/
│   └── utils.ts            # Utility functions
├── App.tsx                 # Main app with providers
└── main.tsx               # React entry point
```

## 🔧 Configuration

### Environment Variables

- `VITE_APTOS_NODE_URL`: Aptos fullnode URL
- `VITE_APTOS_NETWORK`: Network name (testnet/testnet/mainnet)
- `VITE_MODULE_ADDRESS`: Your deployed contract address

### Contract Integration

Update `src/utils/constants.ts` with your deployed contract address:

```typescript
export const MODULE_ADDRESS = "0x..."; // Your contract address
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Manual Deployment

```bash
# Build the app
bun build

# Deploy the dist/ folder to your hosting provider
```

## 🧪 Development

### Code Quality

```bash
# Lint code
bun run lint

# Format code
bun run format
```

### Key Components

- **useKiosk**: Main hook for kiosk operations
- **useAptos**: Aptos SDK integration
- **Header**: Wallet connection and user info
- **Dashboard**: Main layout with kiosk management

## 🔍 Troubleshooting

### Common Issues

1. **Wallet Connection Failed**
   - Ensure Petra wallet is installed
   - Check if you're on the correct network (testnet)

2. **Transaction Failed**
   - Verify you have sufficient APT balance
   - Check if contract address is correct
   - Ensure object exists and you own it

3. **Kiosk Not Found**
   - Clear localStorage and create a new kiosk
   - Verify contract is deployed correctly

### Debug Mode

Enable React Query devtools by adding to your environment:

```bash
VITE_DEBUG=true
```

## 📄 License

This project is provided as-is for educational and development purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues related to:
- Smart contract: Check the contract documentation
- Wallet integration: Refer to Aptos wallet adapter docs
- UI components: Check shadcn/ui documentation
