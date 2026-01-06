# BaseVault - Command Reference

Quick reference for all BaseVault commands.

## 📦 Installation

```bash
# Install all dependencies (root + frontend)
npm run install:all

# Install only root dependencies
npm install

# Install only frontend dependencies
npm run frontend:install
```

---

## 🔨 Smart Contract Development

### Compile

```bash
npm run compile
```

### Test

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

### Clean Build

```bash
npm run clean
```

---

## 🚀 Deployment

### Deploy Contract

```bash
# Local Hardhat network
npm run deploy:local

# Base Sepolia (testnet)
npm run deploy:sepolia

# Base Mainnet (production)
npm run deploy:mainnet
```

### Verify Contract

**⚠️ IMPORTANT**: When using npm scripts, you MUST add `--` before the contract address.

```bash
# CORRECT - Direct Hardhat command (recommended)
npx hardhat verify --network base 0xYOUR_CONTRACT_ADDRESS

# CORRECT - Using npm script (note the -- separator)
npm run verify:mainnet -- 0xYOUR_CONTRACT_ADDRESS

# WRONG - This will fail
npm run verify:mainnet 0xYOUR_CONTRACT_ADDRESS
```

**Examples**:

```bash
# Base Mainnet
npx hardhat verify --network base 0xBDd5a703Af4AEB6A14706b822a473A2a8412f60a

# Base Sepolia
npx hardhat verify --network baseSepolia 0xBDd5a703Af4AEB6A14706b822a473A2a8412f60a
```

**For npm scripts**:

```bash
# Base Mainnet
npm run verify:mainnet -- 0xBDd5a703Af4AEB6A14706b822a473A2a8412f60a

# Base Sepolia
npm run verify:sepolia -- 0xBDd5a703Af4AEB6A14706b822a473A2a8412f60a
```

### Interact with Contract

```bash
node scripts/interact.js <CONTRACT_ADDRESS>
```

**Example**:
```bash
node scripts/interact.js 0xBDd5a703Af4AEB6A14706b822a473A2a8412f60a
```

---

## 💻 Frontend Development

### Run Development Server

```bash
npm run frontend:dev
```

Visit: http://localhost:3000

### Build for Production

```bash
npm run frontend:build
```

Output: `frontend/dist/`

### Preview Production Build

```bash
cd frontend
npm run preview
```

---

## 🎨 Images

### Download Placeholder Images

```bash
bash scripts/download-placeholders.sh
```

This downloads placeholder images to `frontend/public/`:
- `logo.png` (512x512)
- `splash.png` (1080x1920)
- `embed.png` (1200x630)
- `hero.png` (1200x630)
- `screenshots/1.png`, `2.png`, `3.png`

---

## 🔧 Hardhat Direct Commands

You can also use Hardhat commands directly:

```bash
# Compile
npx hardhat compile

# Test
npx hardhat test

# Run local node
npx hardhat node

# Deploy (with network)
npx hardhat run scripts/deploy.js --network base

# Verify
npx hardhat verify --network base <CONTRACT_ADDRESS>

# Clean
npx hardhat clean

# Get help
npx hardhat help
```

---

## 🌐 Network Configuration

Available networks in `hardhat.config.js`:

| Network | Name in Commands | Chain ID | Explorer |
|---------|-----------------|----------|----------|
| Hardhat Local | `localhost` | 31337 | - |
| Base Sepolia | `baseSepolia` | 84532 | https://sepolia.basescan.org |
| Base Mainnet | `base` | 8453 | https://basescan.org |

---

## 🐛 Troubleshooting

### Error: "Unrecognized positional argument"

**Problem**:
```bash
npm run verify:mainnet 0xABCD...
# Error HH308: Unrecognized positional argument 0xABCD...
```

**Solution**: Add `--` before the address
```bash
npm run verify:mainnet -- 0xABCD...
```

**Or use direct command**:
```bash
npx hardhat verify --network base 0xABCD...
```

### Error: "Missing constructor arguments"

If your contract has constructor arguments, add them:

```bash
npx hardhat verify --network base <ADDRESS> "arg1" "arg2"
```

BaseVault has no constructor arguments, so you don't need this.

### Error: "Contract already verified"

This is not an error! Your contract is already verified. You can check it on Basescan.

### Error: "Invalid API Key"

Check your `.env` file:
```bash
BASESCAN_API_KEY=your_actual_api_key_here
```

Get your API key from: https://basescan.org/myapikey

### Error: "Insufficient funds"

You need ETH on Base network:
- For Sepolia: Get test ETH from Base Sepolia faucet
- For Mainnet: Bridge ETH to Base using https://bridge.base.org

---

## 📝 Environment Variables

### Required for Smart Contract

```env
PRIVATE_KEY=your_wallet_private_key_without_0x_prefix
BASESCAN_API_KEY=your_basescan_api_key
```

### Required for Frontend

```env
VITE_CONTRACT_ADDRESS=deployed_contract_address
VITE_BASE_RPC_URL=https://mainnet.base.org
```

### Optional

```env
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
VITE_APP_URL=https://your-app.vercel.app
```

---

## 🔗 Useful Links

- **Base Documentation**: https://docs.base.org
- **Basescan**: https://basescan.org
- **Base Sepolia Testnet**: https://sepolia.basescan.org
- **Hardhat Docs**: https://hardhat.org/docs
- **Vercel**: https://vercel.com

---

## 🚀 Quick Workflows

### First Time Setup

```bash
# 1. Install
npm run install:all

# 2. Configure
cp .env.example .env
# Edit .env with your keys

# 3. Download images
bash scripts/download-placeholders.sh

# 4. Test
npm test

# 5. Run frontend
npm run frontend:dev
```

### Deploy to Testnet

```bash
# 1. Deploy contract
npm run deploy:sepolia
# Save the contract address

# 2. Verify contract
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS>

# 3. Configure frontend
echo "VITE_CONTRACT_ADDRESS=<CONTRACT_ADDRESS>" > frontend/.env

# 4. Test interaction
node scripts/interact.js <CONTRACT_ADDRESS>
```

### Deploy to Production

```bash
# 1. Deploy to Base Mainnet
npm run deploy:mainnet
# Save the contract address

# 2. Verify contract
npx hardhat verify --network base <CONTRACT_ADDRESS>

# 3. Update frontend .env
echo "VITE_CONTRACT_ADDRESS=<CONTRACT_ADDRESS>" > frontend/.env

# 4. Build frontend
npm run frontend:build

# 5. Deploy to Vercel (via GitHub push)
git add .
git commit -m "Production deploy"
git push
```

---

## 💡 Pro Tips

1. **Always use direct Hardhat commands for verification** - it's simpler and less error-prone

2. **Save your contract addresses** - you'll need them for frontend configuration

3. **Test on Sepolia first** - always test on testnet before mainnet

4. **Keep your .env secure** - never commit it to git

5. **Use the placeholder script** - quick way to get started without creating images

---

**Need more help?** Check:
- `README.md` - Full documentation
- `QUICKSTART.md` - Quick start guide
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step deployment
- `IMAGE_GENERATION_GUIDE.md` - Image creation guide
