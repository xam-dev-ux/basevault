# BaseVault

**Collaborative Savings dApp on Base L2**

BaseVault is a decentralized application that enables groups to create savings vaults, contribute ETH collaboratively, and vote democratically on fund releases. Built on Base L2 for low fees and fast transactions.

## 🎯 Use Cases

- **Group Vacations**: Save together for trips and vote on expenses
- **Collective Gifts**: Pool funds for shared presents
- **Shared Projects**: Finance collaborative initiatives
- **Community Funds**: Manage group savings with democratic governance

## ✨ Features

- 🏦 **Create Vaults** with customizable goals and deadlines
- 💰 **Contribute ETH** to any active vault
- 🗳️ **Democratic Voting** (60% approval required)
- 📊 **Real-time Progress Tracking**
- 🔒 **Emergency Withdrawal** after deadline
- 🚀 **Base Mini App** integration for Farcaster

## 🏗️ Architecture

### Smart Contract (`BaseVault.sol`)

- Solidity 0.8.20 optimized for Base L2
- Reentrancy protection
- Custom errors for gas efficiency
- Comprehensive event logging
- 450+ lines of production-ready code

### Frontend

- React 18 + TypeScript
- Vite for fast builds
- Tailwind CSS with dark mode
- ethers.js v6 for Web3 interactions
- Farcaster Mini App SDK integration

## 📋 Prerequisites

- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- ETH on Base network (for deployment)
- Basescan API key (for verification)
- Vercel account (for deployment)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd basevault
npm install
npm run install:all
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `PRIVATE_KEY`: Your wallet private key (without 0x)
- `BASESCAN_API_KEY`: Get from https://basescan.org/myapikey

### 3. Compile and Test Contract

```bash
# Compile contract
npm run compile

# Run tests
npm test

# Check coverage
npm run test:coverage
```

### 4. Deploy Contract to Base

#### Option A: Base Mainnet

```bash
npm run deploy:mainnet
```

#### Option B: Base Sepolia Testnet (recommended for testing)

```bash
npm run deploy:sepolia
```

The deployment script will:
- Deploy the BaseVault contract
- Save deployment info to `deployments/`
- Display contract address and next steps

### 5. Verify Contract on Basescan

```bash
# For Base Mainnet (Option 1: Direct Hardhat command)
npx hardhat verify --network base <CONTRACT_ADDRESS>

# For Base Mainnet (Option 2: Using npm script)
npm run verify:mainnet -- <CONTRACT_ADDRESS>

# For Base Sepolia
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS>
```

**Example**:
```bash
npx hardhat verify --network base 0xBDd5a703Af4AEB6A14706b822a473A2a8412f60a
```

### 6. Test Contract Interaction

```bash
node scripts/interact.js <CONTRACT_ADDRESS>
```

This script will:
- Create a test vault
- Make a contribution
- Display vault information

### 7. Configure Frontend

Update `frontend/.env` (or create it):

```env
VITE_CONTRACT_ADDRESS=<your_deployed_contract_address>
VITE_APP_URL=https://your-app.vercel.app
```

### 8. Run Frontend Locally

```bash
npm run frontend:dev
```

Visit http://localhost:3000

## 🌐 Deploy to Vercel

### First Deployment

1. **Push to GitHub**

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Vercel**

- Go to https://vercel.com
- Import your GitHub repository
- Configure build settings:
  - Framework Preset: **Vite**
  - Root Directory: **frontend**
  - Build Command: `npm run build`
  - Output Directory: `dist`

3. **Add Environment Variables in Vercel**

- Go to Project Settings → Environment Variables
- Add:
  - `VITE_CONTRACT_ADDRESS`: Your deployed contract address
  - `VITE_BASE_RPC_URL`: https://mainnet.base.org (optional)

4. **Deploy**

Click "Deploy" and wait for the build to complete. You'll get a URL like `https://your-app.vercel.app`

### Update App URL

Update these files with your Vercel URL:

1. `frontend/public/.well-known/farcaster.json`:
   - Replace all `https://your-app.vercel.app` with your actual URL

2. `frontend/index.html`:
   - Update Open Graph URLs
   - Update Farcaster metadata URLs

3. Commit and push:

```bash
git add .
git commit -m "Update app URLs"
git push
```

Vercel will automatically redeploy.

## 🎭 Configure as Farcaster Mini App

### Prerequisites

- App deployed to Vercel
- Contract deployed to Base Mainnet
- Farcaster account

### Step 1: Install Farcaster SDK (Already Done)

The SDK is already installed in `frontend/package.json`:

```json
"@farcaster/miniapp-sdk": "^0.1.0"
```

### Step 2: SDK Integration (Already Implemented)

The App.tsx already includes:

```typescript
import sdk from '@farcaster/miniapp-sdk';

useEffect(() => {
  sdk.actions.ready(); // Hides splash screen
}, []);
```

### Step 3: Create Required Images

Create these images and place them in `frontend/public/`:

| File | Dimensions | Description |
|------|------------|-------------|
| `logo.png` | 512x512px | App icon |
| `splash.png` | 1080x1920px | Splash screen (vertical) |
| `embed.png` | 1200x630px | Share card image |
| `hero.png` | 1200x630px | Hero image for app page |
| `screenshots/1.png` | Variable | Screenshot showing vault list |
| `screenshots/2.png` | Variable | Screenshot showing vault detail |
| `screenshots/3.png` | Variable | Screenshot showing proposals |

**Quick Image Generation Options:**

1. **Using Figma/Canva**: Design custom branded images
2. **Using AI**: Use DALL-E or Midjourney with prompts like:
   - "Modern dark blue app icon with vault symbol, 512x512"
   - "Vertical mobile splash screen, dark theme, crypto savings app"
3. **Placeholder Service**: Use https://placehold.co for testing:
   - `logo.png`: Download from https://placehold.co/512x512/0052FF/FFF?text=BV
   - `splash.png`: Download from https://placehold.co/1080x1920/0A0B0D/FFF?text=BaseVault
   - `embed.png`: Download from https://placehold.co/1200x630/0052FF/FFF?text=BaseVault

### Step 4: Generate Account Association

1. Go to https://www.base.dev/preview

2. Click on "Account association" tool

3. Enter your Vercel domain: `your-app.vercel.app`

4. Click "Verify" and follow the instructions:
   - You'll need to sign a message with your Farcaster account
   - This proves you own both the domain and the Farcaster account

5. Copy the generated values:
   - `header`
   - `payload`
   - `signature`

6. Update `frontend/public/.well-known/farcaster.json`:

```json
{
  "accountAssociation": {
    "header": "PASTE_HEADER_HERE",
    "payload": "PASTE_PAYLOAD_HERE",
    "signature": "PASTE_SIGNATURE_HERE"
  },
  "miniapp": {
    ...
  }
}
```

7. Commit and push to trigger Vercel redeploy:

```bash
git add .
git commit -m "Add account association"
git push
```

### Step 5: Verify Mini App Configuration

1. Go to https://www.base.dev/preview

2. Enter your app URL: `https://your-app.vercel.app`

3. Click "Preview"

4. Verify:
   - ✅ Manifest loads correctly
   - ✅ Account association is valid
   - ✅ All images load
   - ✅ App opens in preview

### Step 6: Publish to Base App

1. Create a post in Base App (Farcaster client)

2. Include your app URL in the post

3. Your app will automatically appear as a Mini App card

4. Users can click to launch your app within Base App

### Troubleshooting Mini App

**Issue: Manifest not found**
- Verify `.well-known/farcaster.json` is in `frontend/public/`
- Check Vercel build logs
- Test URL directly: `https://your-app.vercel.app/.well-known/farcaster.json`

**Issue: Account association invalid**
- Regenerate using Base Build Preview tool
- Ensure you're using the correct Farcaster account
- Verify signature matches payload and header

**Issue: Images not loading**
- Check image paths in manifest
- Verify images exist in `frontend/public/`
- Test image URLs directly in browser

**Issue: App doesn't load**
- Check browser console for errors
- Verify contract address is set in environment variables
- Ensure `sdk.actions.ready()` is called

## 💰 Gas Costs on Base

Base L2 offers significantly lower gas costs than Ethereum mainnet:

| Operation | Estimated Gas Cost |
|-----------|-------------------|
| Create Vault | ~0.0001 ETH |
| Contribute | ~0.00005 ETH |
| Create Proposal | ~0.00008 ETH |
| Vote | ~0.00003 ETH |
| Execute Proposal | ~0.00005 ETH |

*Note: Costs vary based on network congestion*

## 📁 Project Structure

```
basevault/
├── contracts/
│   ├── BaseVault.sol          # Main smart contract
│   └── test/
│       └── BaseVault.test.js  # Contract tests
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── hooks/             # Custom hooks
│   │   ├── context/           # React context
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Helper functions
│   │   ├── App.tsx            # Main app component
│   │   └── main.tsx           # Entry point
│   ├── public/
│   │   └── .well-known/
│   │       └── farcaster.json # Mini App manifest
│   └── vercel.json            # Vercel config
├── scripts/
│   ├── deploy.js              # Deployment script
│   ├── verify.js              # Verification script
│   └── interact.js            # Interaction script
├── hardhat.config.js          # Hardhat configuration
└── package.json               # Root dependencies
```

## 🔧 Development

### Run Local Hardhat Node

```bash
npm run node
```

### Deploy to Local Network

```bash
npm run deploy:local
```

### Clean Build Artifacts

```bash
npm run clean
```

### Frontend Development

```bash
cd frontend
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## 🧪 Testing

### Contract Tests

```bash
npm test                # Run all tests
npm run test:coverage   # Generate coverage report
```

Tests cover:
- ✅ Vault creation and validation
- ✅ Contribution logic and events
- ✅ Proposal creation and voting
- ✅ Democratic approval (60% threshold)
- ✅ Proposal execution
- ✅ Emergency withdrawal
- ✅ Access control and permissions
- ✅ Edge cases and error handling

## 📚 Smart Contract API

### Core Functions

#### `createVault(name, description, goal, durationInDays)`
Create a new savings vault.

#### `contribute(vaultId)`
Contribute ETH to a vault (payable).

#### `createProposal(vaultId, recipient, amount, reason)`
Create a withdrawal proposal (contributors only).

#### `vote(proposalId, support)`
Vote on a proposal (contributors only).

#### `executeProposal(proposalId)`
Execute approved proposal.

#### `emergencyWithdraw(vaultId)`
Withdraw contribution after deadline (if no consensus).

### View Functions

#### `getVault(vaultId)`
Get vault details.

#### `getContribution(vaultId, contributor)`
Get user's contribution to vault.

#### `getVaultContributors(vaultId)`
Get list of all contributors.

#### `getProposal(proposalId)`
Get proposal details.

#### `getProposalProgress(proposalId)`
Get voting percentages.

## 🔐 Security

- ✅ Reentrancy protection on all payable functions
- ✅ Custom errors for gas optimization
- ✅ Access control (only contributors can vote)
- ✅ Checks-Effects-Interactions pattern
- ✅ Input validation on all functions
- ✅ SafeMath not needed (Solidity 0.8.20)

## 🌟 Future Enhancements

- [ ] ERC20 token support
- [ ] Multi-signature requirements
- [ ] Recurring contributions
- [ ] Vault templates
- [ ] Social features (comments, likes)
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Useful Links

- [Base Documentation](https://docs.base.org)
- [Base Mini Apps Guide](https://docs.base.org/mini-apps)
- [Basescan Explorer](https://basescan.org)
- [Base Sepolia Testnet](https://sepolia.basescan.org)
- [Hardhat Documentation](https://hardhat.org/docs)
- [ethers.js Documentation](https://docs.ethers.org/v6)
- [Farcaster Mini App SDK](https://docs.farcaster.xyz/developers/miniapps)

## 💬 Support

- Create an issue for bugs or feature requests
- Join our Discord: [Coming Soon]
- Follow us on Twitter: [Coming Soon]

## ⚠️ Disclaimer

This is experimental software. Use at your own risk. Always review smart contract code before interacting with it. Never invest more than you can afford to lose.

---

**Built with ❤️ on Base**
