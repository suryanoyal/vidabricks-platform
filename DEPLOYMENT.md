# Vidabricks Digital Identity Platform — Hosting & Deployment Guide

This platform is configured for **GitHub Pages (Static Export)** with automated **GitHub Actions** CI/CD and custom domain support for **`agents.vidabricks.com`**.

---

## 🌟 Method 1: Deploy on GitHub Pages with Custom Domain (100% Free & Automated)

Your repository already includes:
- ✅ Next.js Static Export configuration (`output: 'export'`)
- ✅ Automated GitHub Actions workflow ([`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml))
- ✅ GitHub Pages `public/.nojekyll` & `public/CNAME` (`agents.vidabricks.com`)

### Step 1: Push Code to your GitHub Repository
```bash
git init
git add .
git commit -m "Vidabricks Digital Platform - Production Release"
git branch -M main
git remote add origin https://github.com/<YOUR-GITHUB-USERNAME>/<YOUR-REPO-NAME>.git
git push -u origin main
```

### Step 2: Enable GitHub Pages in Repository Settings
1. Go to your GitHub repository on [github.com](https://github.com).
2. Click **Settings** (top tab) → **Pages** (left sidebar).
3. Under **Build and deployment**:
   - **Source**: Select **GitHub Actions** (it will automatically use the included workflow).
4. Under **Custom domain**:
   - Verify that **`agents.vidabricks.com`** is listed.
   - Check the box **"Enforce HTTPS"** (available after DNS propagation).

### Step 3: Add DNS CNAME Record in Bluehost
1. Log in to your **[Bluehost Account / cPanel](https://my.bluehost.com)**.
2. Go to **Domains → DNS Zone Editor** (or **Zone Editor** under cPanel).
3. Select `vidabricks.com`.
4. Click **Add DNS Record**:
   - **Type**: `CNAME`
   - **Name / Host**: `agents`
   - **Points to / Target**: `<YOUR-GITHUB-USERNAME>.github.io`
   - **TTL**: `14400` (or default 4 hours)
5. Click **Save Record**.

GitHub will automatically provision a free Let's Encrypt SSL certificate and serve the platform live at:
👉 **`https://agents.vidabricks.com/agents/john-doe`**

---

## 🌐 Method 2: Deploy on Vercel with Bluehost DNS

1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com) → Import repository → Click **Deploy**.
3. In Bluehost DNS Zone Editor, add:
   - **Type**: `CNAME`
   - **Host**: `agents`
   - **Points to**: `cname.vercel-dns.com`
4. In Vercel Settings → **Domains**, add `agents.vidabricks.com`.

---

## 📁 Method 3: Upload Directly to Bluehost cPanel File Manager

1. Run build locally:
   ```bash
   npm run build
   ```
2. The static website is generated in the **`out/`** directory.
3. In **Bluehost cPanel → File Manager**, navigate to `public_html/` (or create a subdomain directory like `public_html/agents/`).
4. Upload all files from the `out/` directory into that folder.
