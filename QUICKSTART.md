# BaseVault Quick Start Guide

Get BaseVault up and running in 10 minutes! 🚀

## Prerequisites

- Node.js 18+
- MetaMask installed
- ETH on Base network

## 🏃 Quick Start (Development)

### 1. Install

```bash
npm install
npm run install:all
```

### 2. Set Up Environment

```bash
cp .env.example .env
```

Edit `.env` and add your keys:
```env
PRIVATE_KEY=your_private_key_here
BASESCAN_API_KEY=your_api_key_here
```

### 3. Compile & Test

```bash
npm run compile
npm test
```

### 4. Download Placeholder Images

```bash
bash scripts/download-placeholders.sh
```

### 5. Deploy Contract (Testnet)

```bash
npm run deploy:sepolia
```

Copy the contract address from output.

### 6. Configure Frontend

Create `frontend/.env`:
```env
VITE_CONTRACT_ADDRESS=<paste_contract_address_here>
```

### 7. Run Frontend

```bash
npm run frontend:dev
```

Visit http://localhost:3000

**That's it!** Your local development environment is ready! 🎉

---

## 🚀 Production Deployment

### Quick Production Deploy

1. **Deploy Contract to Base Mainnet**
```bash
npm run deploy:mainnet
```

2. **Verify Contract**
```bash
npx hardhat verify --network base <CONTRACT_ADDRESS>
```

3. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

4. **Deploy to Vercel**
   - Go to https://vercel.com
   - Import your GitHub repo
   - Set Root Directory: `frontend`
   - Add env var: `VITE_CONTRACT_ADDRESS`
   - Deploy!

5. **Configure as Mini App**
   - Follow steps in `DEPLOYMENT_CHECKLIST.md` Phase 6-9

---

## 📚 Documentation

- **Full Guide**: See `README.md`
- **Deployment**: See `DEPLOYMENT_CHECKLIST.md`
- **Images**: See `IMAGE_GENERATION_GUIDE.md`

---

## 🆘 Common Issues

**Contract deployment fails?**
- Check you have ETH on Base
- Verify private key in `.env`

**Frontend won't connect?**
- Check contract address in `frontend/.env`
- Verify MetaMask is on Base network

**Vercel build fails?**
- Set Root Directory to `frontend`
- Check environment variables

---

## 🎯 Next Steps

1. ✅ Test all features locally
2. ✅ Deploy to production
3. ✅ Configure Mini App
4. ✅ Launch on Base App!

---

**Need Help?** Check the full README.md or create an issue on GitHub.

**Happy Building! 🌟**
