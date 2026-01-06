# BaseVault Deployment Checklist

Complete end-to-end deployment guide for BaseVault to Base Mainnet and Vercel.

## ✅ Pre-Deployment Checklist

- [ ] Node.js 18+ installed
- [ ] npm installed
- [ ] Git installed and configured
- [ ] GitHub account created
- [ ] Vercel account created
- [ ] MetaMask wallet with ETH on Base
- [ ] Basescan API key obtained
- [ ] All images created (see IMAGE_GENERATION_GUIDE.md)

## 📝 Step-by-Step Deployment

### Phase 1: Local Setup ✅

#### 1.1 Clone and Install

```bash
cd basevault
npm install
npm run install:all
```

**Verify**: All dependencies installed without errors

#### 1.2 Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:
```env
PRIVATE_KEY=your_wallet_private_key_without_0x
BASESCAN_API_KEY=your_basescan_api_key
```

**Verify**: `.env` file exists and contains your keys

#### 1.3 Test Locally

```bash
# Compile contract
npm run compile

# Run tests
npm test

# All tests should pass
```

**Verify**: ✅ All tests passing with >80% coverage

---

### Phase 2: Smart Contract Deployment 🚀

#### 2.1 Deploy to Base Sepolia (Testing)

```bash
npm run deploy:sepolia
```

**Expected Output**:
```
✅ BaseVault deployed to: 0x...
📊 Deployment tx: 0x...
```

**Save**: Contract address from output

#### 2.2 Verify on Basescan

```bash
# Direct command (recommended)
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS>

# Or using npm script (requires -- separator)
npm run verify:sepolia -- <CONTRACT_ADDRESS>
```

**Verify**: Contract verified at https://sepolia.basescan.org/address/YOUR_ADDRESS

#### 2.3 Test Contract Interaction

```bash
node scripts/interact.js <CONTRACT_ADDRESS>
```

**Verify**: Script creates vault and contributes successfully

#### 2.4 Deploy to Base Mainnet (Production)

⚠️ **IMPORTANT**: This uses real ETH! Ensure you have enough balance.

```bash
npm run deploy:mainnet
```

**Expected Output**:
```
✅ BaseVault deployed to: 0x...
📊 Deployment tx: 0x...
```

**Save**: Production contract address - YOU WILL NEED THIS!

#### 2.5 Verify on Basescan Mainnet

```bash
# Direct command (recommended)
npx hardhat verify --network base <MAINNET_CONTRACT_ADDRESS>

# Or using npm script (requires -- separator)
npm run verify:mainnet -- <MAINNET_CONTRACT_ADDRESS>
```

**Example**:
```bash
npx hardhat verify --network base 0xBDd5a703Af4AEB6A14706b822a473A2a8412f60a
```

**Verify**: Contract verified at https://basescan.org/address/YOUR_ADDRESS

**Checkpoint**: ✅ Contract deployed and verified on Base Mainnet

---

### Phase 3: Frontend Configuration 🎨

#### 3.1 Create Frontend Environment File

Create `frontend/.env`:

```env
VITE_CONTRACT_ADDRESS=<YOUR_MAINNET_CONTRACT_ADDRESS>
VITE_BASE_RPC_URL=https://mainnet.base.org
```

**Verify**: File created with correct contract address

#### 3.2 Test Frontend Locally

```bash
npm run frontend:dev
```

Visit http://localhost:3000

**Verify**:
- [ ] Page loads without errors
- [ ] Can connect wallet
- [ ] Can see "Create Vault" button
- [ ] Contract address is set (check console)

#### 3.3 Build Frontend

```bash
cd frontend
npm run build
```

**Verify**: `frontend/dist/` directory created

---

### Phase 4: GitHub Setup 📦

#### 4.1 Initialize Git (if not already)

```bash
git init
git add .
git commit -m "Initial commit: BaseVault dApp"
```

#### 4.2 Create GitHub Repository

1. Go to https://github.com/new
2. Create new repository named `basevault`
3. Don't initialize with README (already have one)

#### 4.3 Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/basevault.git
git branch -M main
git push -u origin main
```

**Verify**: Code visible on GitHub

**Checkpoint**: ✅ Code on GitHub

---

### Phase 5: Vercel Deployment 🌐

#### 5.1 Import Project to Vercel

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

#### 5.2 Add Environment Variables

In Vercel dashboard → Settings → Environment Variables, add:

| Name | Value |
|------|-------|
| `VITE_CONTRACT_ADDRESS` | Your Base Mainnet contract address |
| `VITE_BASE_RPC_URL` | `https://mainnet.base.org` |

**Verify**: Variables added and saved

#### 5.3 Deploy

Click "Deploy"

**Wait for**: Build to complete (2-3 minutes)

**Get**: Your Vercel URL (e.g., `https://basevault-xyz.vercel.app`)

**Verify**:
- [ ] App loads at Vercel URL
- [ ] Can connect wallet
- [ ] Can interact with contract

**Checkpoint**: ✅ App deployed to Vercel

---

### Phase 6: Mini App Configuration 🎭

#### 6.1 Update App URLs

Edit these files with your actual Vercel URL:

**File 1**: `frontend/public/.well-known/farcaster.json`

Find and replace ALL occurrences of `https://your-app.vercel.app` with your actual URL.

**File 2**: `frontend/index.html`

Update:
- Line ~14: `<meta property="og:url" content="https://your-actual-url.vercel.app/" />`
- Line ~16: `<meta property="og:image" content="https://your-actual-url.vercel.app/embed.png" />`
- And all other URLs in meta tags

#### 6.2 Verify Images

Check that all images exist:

```bash
ls -la frontend/public/logo.png
ls -la frontend/public/splash.png
ls -la frontend/public/embed.png
ls -la frontend/public/hero.png
ls -la frontend/public/screenshots/
```

If missing, follow IMAGE_GENERATION_GUIDE.md

#### 6.3 Commit and Redeploy

```bash
git add .
git commit -m "Update URLs for Vercel deployment"
git push
```

Vercel will auto-redeploy (wait ~2 minutes)

**Verify**: Changes live at your Vercel URL

#### 6.4 Test Manifest

Visit: `https://your-app.vercel.app/.well-known/farcaster.json`

**Should see**: JSON with your app configuration

**Verify**:
- [ ] JSON loads correctly
- [ ] All image URLs are correct
- [ ] `homeUrl` matches your Vercel URL

---

### Phase 7: Farcaster Account Association 🔐

#### 7.1 Go to Base Build Preview

Visit: https://www.base.dev/preview

#### 7.2 Generate Account Association

1. Click "Account association" tool
2. Enter your domain: `your-app.vercel.app` (without https://)
3. Click "Verify"
4. Follow Farcaster signing instructions
5. Copy the generated values:
   - `header`
   - `payload`
   - `signature`

#### 7.3 Update Manifest

Edit `frontend/public/.well-known/farcaster.json`:

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

#### 7.4 Commit and Redeploy

```bash
git add frontend/public/.well-known/farcaster.json
git commit -m "Add Farcaster account association"
git push
```

Wait for Vercel redeploy

**Verify**: Updated manifest at `https://your-app.vercel.app/.well-known/farcaster.json`

---

### Phase 8: Final Verification 🎯

#### 8.1 Verify in Base Build Preview

1. Go to https://www.base.dev/preview
2. Enter your app URL
3. Click "Preview"

**Check**:
- [ ] ✅ Manifest valid
- [ ] ✅ Account association valid
- [ ] ✅ All images load
- [ ] ✅ App preview works

#### 8.2 Test Full User Flow

1. Open your Vercel URL
2. Connect wallet
3. Switch to Base network
4. Create a test vault
5. Contribute to vault
6. Verify transaction on Basescan

**All working?** ✅ You're ready to launch!

---

### Phase 9: Launch on Base App 🚀

#### 9.1 Create Launch Post

1. Open Base App (Farcaster client)
2. Create a new post
3. Include:
   - Your app URL
   - Description of BaseVault
   - What makes it useful
   - Call to action

Example:
```
Just launched BaseVault on Base! 🎉

Save together with friends using collaborative vaults:
💰 Pool funds for group goals
🗳️ Vote democratically on withdrawals
🔒 Secure smart contract on Base L2

Try it now: https://your-app.vercel.app

#Base #DeFi #Web3
```

#### 9.2 Share Everywhere

Share your launch on:
- [ ] Twitter/X
- [ ] Farcaster (Base App)
- [ ] Discord communities
- [ ] Reddit (r/Base, r/ethereum)
- [ ] Product Hunt (optional)

---

## 🎉 Post-Launch Checklist

- [ ] Monitor contract on Basescan
- [ ] Watch for user feedback
- [ ] Fix any bugs reported
- [ ] Plan feature updates
- [ ] Engage with community

---

## 🐛 Troubleshooting

### Issue: Contract deployment fails

**Solution**:
- Check you have enough ETH on Base
- Verify private key is correct (no 0x prefix)
- Try increasing gas limit in hardhat.config.js

### Issue: Vercel build fails

**Solution**:
- Check build logs in Vercel dashboard
- Verify all dependencies in package.json
- Ensure Root Directory is set to `frontend`
- Check environment variables are set

### Issue: Mini App doesn't appear

**Solution**:
- Verify manifest is accessible at /.well-known/farcaster.json
- Check account association is valid
- Ensure all image URLs return 200 OK
- Verify you're posting from correct Farcaster account

### Issue: Wallet won't connect

**Solution**:
- Check MetaMask is installed
- Verify you're on Base network
- Clear browser cache
- Check console for errors

### Issue: Transactions fail

**Solution**:
- Verify contract address is correct
- Check wallet has ETH on Base
- Ensure you're on Base Mainnet (not Sepolia)
- Check contract is verified on Basescan

---

## 📊 Success Metrics

Track these after launch:

- [ ] Total vaults created
- [ ] Total ETH deposited
- [ ] Number of unique users
- [ ] Proposals created/executed
- [ ] Community engagement

---

## 🔄 Updating After Launch

To push updates:

1. Make changes locally
2. Test thoroughly
3. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```
4. Vercel auto-deploys
5. Verify changes live

---

## 🎊 You're Live!

Congratulations on launching BaseVault! 🚀

**Next Steps**:
- Monitor usage and gather feedback
- Plan v2 features
- Build community
- Consider audit for larger TVL

---

**Questions?**
- Check README.md
- Review documentation
- Create GitHub issue
- Ask in Base Discord

**Good luck with your launch! 🌟**
