# Image Generation Guide for BaseVault

This guide provides detailed instructions for creating all required images for the BaseVault Mini App.

## 📋 Required Images

| File | Size | Purpose | Format |
|------|------|---------|--------|
| `logo.png` | 512x512px | App icon, shown in Mini App launcher | PNG |
| `splash.png` | 1080x1920px | Loading screen when app launches | PNG |
| `embed.png` | 1200x630px | Social share card image | PNG |
| `hero.png` | 1200x630px | Featured image on app page | PNG |
| `screenshots/1.png` | 750x1334px+ | Vault list view | PNG |
| `screenshots/2.png` | 750x1334px+ | Vault detail view | PNG |
| `screenshots/3.png` | 750x1334px+ | Proposals/voting view | PNG |

## 🎨 Design Guidelines

### Brand Colors

```
Primary Blue: #0052FF (Base brand color)
Dark Blue: #0041CC
Light Blue: #336CFF
Background: #0A0B0D
Surface: #111214
Text: #E5E7EB
```

### Typography

- Primary Font: Inter, SF Pro, or similar modern sans-serif
- Heading style: Bold, clear hierarchy
- Body text: Medium weight, good contrast

## 🖼️ Image Creation Methods

### Method 1: Using Figma (Recommended)

1. **Create Figma Account** (free): https://figma.com

2. **Download BaseVault Figma Template**:
   - Use community templates or create from scratch
   - Set up frames with exact dimensions

3. **Design Each Image**:

   **Logo (512x512px)**:
   - Create square frame
   - Add gradient background (#0052FF to #0041CC)
   - Add vault/lock icon or "BV" text
   - Export as PNG

   **Splash Screen (1080x1920px)**:
   - Create vertical frame
   - Dark background (#0A0B0D)
   - Center logo (256x256px)
   - Add "BaseVault" text below
   - Add tagline: "Save together, decide together"
   - Export as PNG

   **Embed/Hero (1200x630px)**:
   - Horizontal frame
   - Eye-catching design with logo
   - Include key features or screenshot
   - Add gradient overlay
   - Export as PNG

   **Screenshots (750x1334px minimum)**:
   - Take screenshots of your running app
   - Use Chrome DevTools mobile view
   - Or design mockups in Figma
   - Show actual UI states

4. **Export Settings**:
   - Format: PNG
   - Scale: 2x for retina quality
   - Compression: Medium

### Method 2: Using Canva (Easy)

1. **Go to** https://canva.com

2. **Create Custom Sizes**:
   - Click "Create a design"
   - Enter custom dimensions

3. **Use Templates**:
   - Search "app icon", "splash screen", "social media"
   - Customize with BaseVault branding

4. **Design Tips**:
   - Use dark theme (#0A0B0D background)
   - Add gradient overlays with #0052FF
   - Include vault/safe icons from Canva library
   - Use consistent fonts

5. **Download**:
   - File type: PNG
   - Quality: Highest

### Method 3: Using AI (Midjourney/DALL-E)

**Prompts for Each Image**:

**Logo (512x512)**:
```
modern minimalist app icon, vault symbol, gradient blue (#0052FF to #0041CC),
dark background, geometric design, sharp edges, professional, 512x512,
crypto/web3 style, centered composition
```

**Splash Screen (1080x1920)**:
```
mobile app splash screen, vertical format, dark theme (#0A0B0D background),
centered logo, "BaseVault" typography, modern sans-serif, gradient blue accents,
minimalist, professional, fintech aesthetic
```

**Embed/Hero (1200x630)**:
```
social media card, collaborative savings app, dark theme, gradient blue and purple,
vault icons, group collaboration symbols, modern UI elements, professional,
fintech design, "BaseVault" branding
```

**Post-processing**:
- Resize to exact dimensions in Photoshop/GIMP
- Adjust colors to match brand palette
- Add text overlays if needed

### Method 4: Quick Placeholders (For Testing)

Use placeholders to test the app, then replace with final designs:

**Download these placeholder images**:

1. **Logo**: https://placehold.co/512x512/0052FF/FFFFFF?text=BV
2. **Splash**: https://placehold.co/1080x1920/0A0B0D/FFFFFF?text=BaseVault
3. **Embed**: https://placehold.co/1200x630/0052FF/FFFFFF?text=BaseVault
4. **Hero**: https://placehold.co/1200x630/0041CC/FFFFFF?text=BaseVault
5. **Screenshots**: Take actual screenshots of running app

**To save placeholders**:
```bash
cd basevault/frontend/public

# Download placeholders
curl "https://placehold.co/512x512/0052FF/FFFFFF?text=BV" -o logo.png
curl "https://placehold.co/1080x1920/0A0B0D/FFFFFF?text=BaseVault" -o splash.png
curl "https://placehold.co/1200x630/0052FF/FFFFFF?text=BaseVault" -o embed.png
curl "https://placehold.co/1200x630/0041CC/FFFFFF?text=BaseVault" -o hero.png

# Create screenshots directory
mkdir -p screenshots
```

### Method 5: Taking App Screenshots

**For Real Screenshots**:

1. **Run the app locally**:
```bash
npm run frontend:dev
```

2. **Open in Chrome**: http://localhost:3000

3. **Open DevTools**: F12 or Cmd+Option+I

4. **Enable Device Toolbar**: Cmd+Shift+M (Mac) or Ctrl+Shift+M (Windows)

5. **Select Device**: Choose "iPhone 12 Pro" or similar

6. **Capture Screenshots**:
   - Screenshot 1: Vault list view (show multiple vaults)
   - Screenshot 2: Vault detail view (show progress, contributors)
   - Screenshot 3: Proposals tab (show voting interface)

7. **Save Screenshots**:
   - Right-click → "Capture screenshot"
   - Or use OS screenshot tool
   - Save to `frontend/public/screenshots/`
   - Name as `1.png`, `2.png`, `3.png`

## 🔧 Image Optimization

After creating images, optimize them:

### Using TinyPNG (Online)

1. Go to https://tinypng.com
2. Upload your PNG files
3. Download optimized versions
4. Replace original files

### Using ImageOptim (Mac)

```bash
brew install imageoptim
imageoptim frontend/public/*.png
```

### Using pngquant (Cross-platform)

```bash
# Install
npm install -g pngquant-bin

# Optimize
pngquant frontend/public/logo.png --output frontend/public/logo.png
```

## ✅ Verification Checklist

Before deploying, verify:

- [ ] All images are in `frontend/public/`
- [ ] `logo.png` is 512x512px
- [ ] `splash.png` is 1080x1920px
- [ ] `embed.png` is 1200x630px
- [ ] `hero.png` exists and is appropriate size
- [ ] All 3 screenshots are in `screenshots/` folder
- [ ] All images use consistent branding (colors, style)
- [ ] Images are optimized (< 500KB each)
- [ ] Images look good on dark backgrounds
- [ ] Manifest URLs point to correct image paths

## 🎯 Final Steps

1. Place all images in correct locations:
```
frontend/public/
├── logo.png
├── splash.png
├── embed.png
├── hero.png
└── screenshots/
    ├── 1.png
    ├── 2.png
    └── 3.png
```

2. Update manifest if needed:
   - Check `frontend/public/.well-known/farcaster.json`
   - Verify all image URLs are correct

3. Update index.html meta tags:
   - Check `frontend/index.html`
   - Verify Open Graph image URLs

4. Test locally:
```bash
npm run frontend:dev
```

5. Commit and push:
```bash
git add frontend/public/
git commit -m "Add Mini App images"
git push
```

6. Verify on Vercel:
   - Check that all images are accessible
   - Test URLs directly:
     - `https://your-app.vercel.app/logo.png`
     - `https://your-app.vercel.app/splash.png`
     - etc.

## 🎨 Professional Design Resources

### Icon Libraries
- [Heroicons](https://heroicons.com) - Free MIT icons
- [Lucide](https://lucide.dev) - Beautiful consistent icons
- [Iconoir](https://iconoir.com) - Open source icons

### Color Palettes
- [Coolors](https://coolors.co) - Generate color schemes
- [Adobe Color](https://color.adobe.com) - Professional palettes

### Mockup Tools
- [Screely](https://screely.com) - Browser mockups
- [Mockup World](https://www.mockupworld.co) - Free mockups

### Screenshot Tools
- [Cleanmock](https://cleanmock.com) - Clean device mockups
- [Screenstab](https://www.screenstab.com) - Browser screenshots

## 💡 Pro Tips

1. **Keep source files**: Save your Figma/Canva projects for future updates

2. **Version control**: Don't commit huge image files to git if possible
   - Use Git LFS for large binaries
   - Or host images on CDN

3. **A/B testing**: Create multiple versions and test which performs better

4. **Consistency**: Use same style across all images for brand recognition

5. **Accessibility**: Ensure good contrast for visually impaired users

6. **Mobile-first**: Test how images look on actual mobile devices

---

**Need Help?**

If you need professional design help:
- Hire on Fiverr (search "app icon design" or "splash screen")
- Use 99designs for design contests
- Ask in design communities (Dribbble, Behance)

**Quick Start Option**: Use the placeholder method above to get your app running immediately, then upgrade to professional images when ready!
