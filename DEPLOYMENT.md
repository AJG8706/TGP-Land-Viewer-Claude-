# Deployment Guide

This project uses **GitHub Pages with automatic preview deployments** for every branch.

## Live URLs

### Production
- **Main Branch:** `https://ajg8706.github.io/TGP-Land-Viewer-Claude-/`

### Preview Branches
- **Any Branch:** `https://ajg8706.github.io/TGP-Land-Viewer-Claude-/preview/{branch-name}/`
- **Preview Index:** `https://ajg8706.github.io/TGP-Land-Viewer-Claude-/preview/`

Example:
- Branch `claude/3d-property-visualizer-01QC4rfZCjMsytuxs7FXmSAj` →
  `https://ajg8706.github.io/TGP-Land-Viewer-Claude-/preview/claude-3d-property-visualizer-01QC4rfZCjMsytuxs7FXmSAj/`

## How It Works

### Automatic Deployment
Every push to any branch automatically:
1. Builds the application
2. Deploys to GitHub Pages
3. Creates a preview URL for that branch
4. Comments the preview URL on pull requests

### Deploy Times
- **Build:** ~2 minutes
- **Total time from push to live:** ~2-3 minutes

## Setup (One-Time)

### 1. Enable GitHub Pages
1. Go to your repository on GitHub
2. Navigate to **Settings** → **Pages**
3. Under "Build and deployment":
   - **Source:** Deploy from a branch
   - **Branch:** `gh-pages` / `(root)`
4. Click **Save**

### 2. Create gh-pages Branch
```bash
# Create and push empty gh-pages branch
git checkout --orphan gh-pages
git rm -rf .
echo "# GitHub Pages" > README.md
git add README.md
git commit -m "Initialize gh-pages"
git push origin gh-pages

# Return to your working branch
git checkout claude/3d-property-visualizer-01QC4rfZCjMsytuxs7FXmSAj
```

### 3. Push Workflow
The workflow file is already committed. Just push:
```bash
git push
```

## Usage

### Testing a Feature
```bash
# Create a feature branch
git checkout -b feature/new-models

# Make your changes
# ... edit files ...

# Commit and push
git add .
git commit -m "Add new 3D models"
git push origin feature/new-models
```

**Preview URL:** `https://ajg8706.github.io/TGP-Land-Viewer-Claude-/preview/feature-new-models/`

### Creating a Pull Request
When you create a PR, the bot automatically comments with:
```
🚀 Preview deployed!

✨ Preview URL: https://ajg8706.github.io/TGP-Land-Viewer-Claude-/preview/feature-new-models/

📋 View all previews
```

### Viewing All Previews
Visit: `https://ajg8706.github.io/TGP-Land-Viewer-Claude-/preview/`

This shows a list of all active preview branches.

## Deployment Workflow

```
┌─────────────┐
│  git push   │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ GitHub Actions      │
│ - Checkout code     │
│ - Install deps      │
│ - Build with Vite   │
│ - Deploy to gh-pages│
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ GitHub Pages        │
│ Serves static files │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Live at URL!        │
│ (2-3 min later)     │
└─────────────────────┘
```

## Comparison: GitHub vs Vercel

| Feature | GitHub Pages (This Setup) | Vercel |
|---------|---------------------------|--------|
| **Preview URLs** | ✅ Per branch | ✅ Per commit |
| **Deploy Time** | 2-3 min | 30-60 sec |
| **External Account** | ❌ Not needed | ✅ Required |
| **Cost** | Free unlimited | Free tier limits |
| **Setup Complexity** | Medium | Easy |
| **GitHub Integration** | Native | Via OAuth |
| **Custom Domains** | ✅ | ✅ |
| **SSL** | ✅ | ✅ |

## Troubleshooting

### Workflow Not Running
1. Check **Actions** tab on GitHub
2. Ensure Actions are enabled: Settings → Actions → General
3. Check workflow file syntax

### 404 Errors
1. Verify base path in `vite.config.ts` matches repo name
2. Check GitHub Pages is enabled
3. Ensure `gh-pages` branch exists

### Preview Not Updating
1. Check workflow completed successfully in Actions tab
2. Hard refresh browser: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
3. Clear browser cache

### Build Failures
1. Check Actions logs for error details
2. Test build locally: `npm run build`
3. Ensure all dependencies are in package.json

## Local Development

```bash
# Install
npm install

# Dev server (hot reload)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Manual Deployment

If you need to deploy manually:

```bash
# Build
npm run build

# Deploy to gh-pages
npx gh-pages -d dist
```

## Environment Variables

The workflow automatically sets:
- `VITE_BASE_PATH` - Base path for routing

For local development with production paths:
```bash
VITE_BASE_PATH=/TGP-Land-Viewer-Claude-/ npm run dev
```

## Monitoring

### Check Deployment Status
1. Go to **Actions** tab
2. Click on latest workflow run
3. View logs and deployment status

### GitHub Pages Status
Settings → Pages shows:
- ✅ Your site is live at...
- Last deployment time
- Custom domain status (if configured)

## Advanced: Custom Domain

1. Add CNAME record: `viewer.yourdomain.com` → `ajg8706.github.io`
2. In repo Settings → Pages → Custom domain: `viewer.yourdomain.com`
3. Wait for DNS propagation (5-60 minutes)
4. GitHub auto-provisions SSL certificate

## Security

All deployments:
- Use HTTPS (SSL certificate auto-provisioned)
- Served from GitHub's CDN
- No server-side code execution (static files only)

## Support

- GitHub Pages docs: https://docs.github.com/pages
- GitHub Actions docs: https://docs.github.com/actions
- Vite deployment: https://vitejs.dev/guide/static-deploy
